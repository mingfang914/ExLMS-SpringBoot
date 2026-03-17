-- =============================================================================
-- LMS (Learning Management System) — MySQL DDL Script
-- Version  : 2.0.0
-- Date     : 2026-03-16
-- Encoding : UTF-8
-- Dialect  : MySQL 8.4.3
-- Engine   : InnoDB (all tables)
-- Charset  : utf8mb4 / utf8mb4_unicode_ci
-- =============================================================================
-- Optimizations in v2:
--   [1] UUID v7  — All PKs and FKs use BINARY(16) storing UUID v7.
--                  UUID v7 is time-ordered (ms precision), eliminating B-tree
--                  fragmentation that CHAR(36) random UUIDs cause.
--                  Helper: uuid_v7()        → BINARY(16)
--                  Helper: bin_to_uuid16(b) → VARCHAR(36) for display
--   [2] MinIO    — All file-storage columns no longer hold public URLs.
--                  Instead they store a CHAR(36) UUID that is the object key
--                  on MinIO. The application layer constructs signed/proxy URLs
--                  at request time, keeping storage references private.
-- =============================================================================
-- Domain overview:
--   0.  Setup          — Database, helpers
--   1.  UUID v7 helper — uuid_v7() function + bin_to_uuid16() display helper
--   2.  Users & Auth   — users, sessions, oauth, notification_settings
--   3.  Forum          — posts, comments, tags, votes, attachments
--   4.  Study Groups   — groups, members, join-requests, feed
--   5.  Courses        — courses, chapters, lessons, enrollments, progress
--   6.  Quizzes        — quizzes, questions, answers, attempts, responses
--   7.  Assignments    — assignments, submissions, grades
--   8.  Meetings       — meetings, attendances, polls
--   9.  Calendar       — calendar_events (materialized per user)
--  10.  Notifications  — notifications inbox
--  11.  Triggers       — denormalized counters
--  12.  Views          — useful read-only aggregates
-- =============================================================================


-- =============================================================================
-- 0. DATABASE SETUP
-- =============================================================================

CREATE DATABASE IF NOT EXISTS ExLMS
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ExLMS;

SET NAMES utf8mb4;
SET time_zone = '+00:00';


-- =============================================================================
-- 1. UUID v7 HELPERS
-- =============================================================================
-- UUID v7 layout (128 bits):
--   [48-bit unix_ts_ms][4-bit ver=0x7][12-bit seq][2-bit var][62-bit rand]
-- Stored as BINARY(16) → compact, index-friendly, monotonically increasing.
--
-- Usage:
--   INSERT: 
--   SELECT readable: SELECT bin_to_uuid16(id) FROM users;
--   WHERE by string:  WHERE id = uuid_to_bin('018f-...', 0)
--                     or use the inverse: WHERE id = uuid_v7_from_str('018f-...')
-- =============================================================================

DELIMITER $$

-- Generate a UUID v7 as BINARY(16)
CREATE FUNCTION uuid_v7()
RETURNS BINARY(16)
NOT DETERMINISTIC
NO SQL
BEGIN
    DECLARE ts      BIGINT UNSIGNED DEFAULT (UNIX_TIMESTAMP(NOW(3)) * 1000);
    DECLARE ts_hex  VARCHAR(12)     DEFAULT LPAD(HEX(ts), 12, '0');
    DECLARE rand1   VARCHAR(4)      DEFAULT LPAD(HEX(FLOOR(RAND() * 0xFFF)), 3, '0');
    DECLARE rand2   VARCHAR(16)     DEFAULT LPAD(HEX(FLOOR(RAND() * 0x3FFFFFFFFFFFFFFF)), 16, '0');
    -- ver=7 (4 bits) | 12-bit seq  →  7xxx
    -- var=10 (2 bits) | 62-bit rand → 8xxx..Bxxx
    DECLARE uuid_str VARCHAR(32) DEFAULT CONCAT(
        ts_hex,                         -- 48-bit timestamp
        '7', rand1,                     -- version nibble + 12-bit rand
        SUBSTR(CONCAT('8', rand2), 1, 4), -- variant + first rand chunk
        SUBSTR(rand2, 5, 12)            -- remaining rand
    );
    RETURN UNHEX(uuid_str);
END$$

-- Convert BINARY(16) back to human-readable UUID string (for SELECTs / APIs)
CREATE FUNCTION bin_to_uuid16(b BINARY(16))
RETURNS VARCHAR(36)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE h VARCHAR(32) DEFAULT LOWER(HEX(b));
    RETURN CONCAT(
        SUBSTR(h,  1, 8), '-',
        SUBSTR(h,  9, 4), '-',
        SUBSTR(h, 13, 4), '-',
        SUBSTR(h, 17, 4), '-',
        SUBSTR(h, 21, 12)
    );
END$$

-- Convert a UUID string back to BINARY(16) (for WHERE clauses from application)
CREATE FUNCTION uuid16_to_bin(s VARCHAR(36))
RETURNS BINARY(16)
DETERMINISTIC
NO SQL
BEGIN
    RETURN UNHEX(REPLACE(s, '-', ''));
END$$

DELIMITER ;


-- =============================================================================
-- 2. USERS & AUTH
-- =============================================================================

CREATE TABLE users (
    id                  BINARY(16)      NOT NULL ,
    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NULL COMMENT 'bcrypt hash; NULL for OAuth-only accounts',
    full_name           VARCHAR(150)    NOT NULL,
    avatar_key          CHAR(36)        NULL     COMMENT 'MinIO object key (UUID) for avatar image; app builds signed URL',
    bio                 TEXT            NULL,
    role                ENUM('admin','instructor','student')
                                        NOT NULL DEFAULT 'student',
    status              ENUM('pending','active','suspended','deleted')
                                        NOT NULL DEFAULT 'pending',
    email_verified      TINYINT(1)      NOT NULL DEFAULT 0,
    verification_token  VARCHAR(128)    NULL,
    reset_token         VARCHAR(128)    NULL,
    reset_token_expires DATETIME        NULL,
    failed_login_count  TINYINT         NOT NULL DEFAULT 0,
    locked_until        DATETIME        NULL,
    last_login_at       DATETIME        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email (email),
    INDEX   idx_users_role   (role),
    INDEX   idx_users_status (status),
    FULLTEXT INDEX ft_users_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Core user accounts for all roles.';


-- ── Sessions (refresh-token store) ───────────────────────────────────────────
CREATE TABLE user_sessions (
    id            BINARY(16)   NOT NULL ,
    user_id       BINARY(16)   NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    ip_address    VARCHAR(45)  NULL,
    user_agent    TEXT         NULL,
    expires_at    DATETIME     NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_sessions_token   (refresh_token(191)),
    INDEX   idx_sessions_user_id   (user_id),
    INDEX   idx_sessions_expires   (expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── OAuth accounts ────────────────────────────────────────────────────────────
CREATE TABLE oauth_accounts (
    id           BINARY(16)   NOT NULL ,
    user_id      BINARY(16)   NOT NULL,
    provider     VARCHAR(50)  NOT NULL COMMENT 'google | microsoft',
    provider_id  VARCHAR(255) NOT NULL,
    access_token TEXT         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_oauth_provider (provider, provider_id),
    INDEX   idx_oauth_user_id (user_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Per-user notification preferences ────────────────────────────────────────
CREATE TABLE notification_settings (
    id                    BINARY(16) NOT NULL ,
    user_id               BINARY(16) NOT NULL,
    new_assignment        TINYINT(1) NOT NULL DEFAULT 1,
    assignment_graded     TINYINT(1) NOT NULL DEFAULT 1,
    assignment_due_soon   TINYINT(1) NOT NULL DEFAULT 1,
    new_meeting           TINYINT(1) NOT NULL DEFAULT 1,
    meeting_starting_soon TINYINT(1) NOT NULL DEFAULT 1,
    new_course            TINYINT(1) NOT NULL DEFAULT 1,
    forum_reply           TINYINT(1) NOT NULL DEFAULT 1,
    mention               TINYINT(1) NOT NULL DEFAULT 1,
    group_join_request    TINYINT(1) NOT NULL DEFAULT 1,
    email_enabled         TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_notif_user (user_id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 3. FORUM
-- =============================================================================

-- ── Tags ──────────────────────────────────────────────────────────────────────
CREATE TABLE forum_tags (
    id          BINARY(16)  NOT NULL ,
    name        VARCHAR(60) NOT NULL,
    slug        VARCHAR(80) NOT NULL,
    description TEXT        NULL,
    color       CHAR(7)     NOT NULL DEFAULT '#6366F1' COMMENT 'hex color code',
    post_count  INT         NOT NULL DEFAULT 0,
    created_by  BINARY(16)  NULL,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_tags_name (name),
    UNIQUE  KEY uq_tags_slug (slug),
    CONSTRAINT fk_tags_creator FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Posts ─────────────────────────────────────────────────────────────────────
CREATE TABLE forum_posts (
    id           BINARY(16)                                    NOT NULL ,
    author_id    BINARY(16)                                    NOT NULL,
    title        VARCHAR(200)                                  NOT NULL,
    content      LONGTEXT                                      NOT NULL,
    status       ENUM('draft','published','hidden','deleted')  NOT NULL DEFAULT 'published',
    view_count   INT                                           NOT NULL DEFAULT 0,
    upvote_count INT                                           NOT NULL DEFAULT 0,
    is_pinned    TINYINT(1)                                    NOT NULL DEFAULT 0,
    is_closed    TINYINT(1)                                    NOT NULL DEFAULT 0,
    edited_at    DATETIME                                      NULL,
    created_at   DATETIME                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_posts_author_id  (author_id),
    INDEX   idx_posts_status     (status),
    INDEX   idx_posts_created_at (created_at DESC),
    INDEX   idx_posts_upvotes    (upvote_count DESC),
    FULLTEXT INDEX ft_posts_search (title, content),
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='upvote_count is a denormalized counter updated by trigger.';


-- ── Post ↔ Tag join table ─────────────────────────────────────────────────────
CREATE TABLE forum_post_tags (
    post_id BINARY(16) NOT NULL,
    tag_id  BINARY(16) NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    INDEX   idx_post_tags_tag_id (tag_id),
    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id)
        REFERENCES forum_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tags_tag  FOREIGN KEY (tag_id)
        REFERENCES forum_tags  (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Tag followers ─────────────────────────────────────────────────────────────
CREATE TABLE forum_tag_followers (
    user_id    BINARY(16) NOT NULL,
    tag_id     BINARY(16) NOT NULL,
    created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tag_id),
    CONSTRAINT fk_tag_followers_user FOREIGN KEY (user_id)
        REFERENCES users      (id) ON DELETE CASCADE,
    CONSTRAINT fk_tag_followers_tag  FOREIGN KEY (tag_id)
        REFERENCES forum_tags (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Comments (nested, max 3 levels enforced in app) ──────────────────────────
CREATE TABLE forum_comments (
    id           BINARY(16)  NOT NULL ,
    post_id      BINARY(16)  NOT NULL,
    author_id    BINARY(16)  NOT NULL,
    parent_id    BINARY(16)  NULL COMMENT 'NULL = top-level comment',
    content      TEXT        NOT NULL,
    upvote_count INT         NOT NULL DEFAULT 0,
    is_accepted  TINYINT(1)  NOT NULL DEFAULT 0,
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_comments_post_id   (post_id),
    INDEX   idx_comments_author_id (author_id),
    INDEX   idx_comments_parent_id (parent_id),
    CONSTRAINT fk_comments_post   FOREIGN KEY (post_id)
        REFERENCES forum_posts    (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id)
        REFERENCES users          (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id)
        REFERENCES forum_comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Votes (polymorphic: post or comment) ─────────────────────────────────────
CREATE TABLE forum_votes (
    id          BINARY(16)                          NOT NULL ,
    user_id     BINARY(16)                          NOT NULL,
    target_id   BINARY(16)                          NOT NULL,
    target_type ENUM('forum_post','forum_comment')   NOT NULL,
    vote_type   ENUM('upvote','downvote')            NOT NULL DEFAULT 'upvote',
    created_at  DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_votes_user_target (user_id, target_id, target_type),
    INDEX   idx_votes_target (target_id, target_type),
    CONSTRAINT fk_votes_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Saved posts ───────────────────────────────────────────────────────────────
CREATE TABLE forum_saved_posts (
    user_id  BINARY(16) NOT NULL,
    post_id  BINARY(16) NOT NULL,
    saved_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id)
        REFERENCES users       (id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_post FOREIGN KEY (post_id)
        REFERENCES forum_posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── File attachments on posts ─────────────────────────────────────────────────
CREATE TABLE forum_attachments (
    id          BINARY(16)   NOT NULL ,
    post_id     BINARY(16)   NOT NULL,
    filename    VARCHAR(255) NOT NULL COMMENT 'Original filename shown to user',
    object_key  CHAR(36)     NOT NULL COMMENT 'MinIO object key (UUID); app builds signed URL from this',
    file_size   INT          NOT NULL COMMENT 'bytes',
    mime_type   VARCHAR(100) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_attachments_key (object_key),
    INDEX   idx_attachments_post_id (post_id),
    CONSTRAINT fk_attachments_post FOREIGN KEY (post_id)
        REFERENCES forum_posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 4. STUDY GROUPS
-- =============================================================================

CREATE TABLE study_groups (
    id           BINARY(16)                     NOT NULL ,
    owner_id     BINARY(16)                     NOT NULL,
    name         VARCHAR(150)                   NOT NULL,
    description  TEXT                           NULL,
    cover_key    CHAR(36)                       NULL COMMENT 'MinIO object key (UUID) for cover image',
    visibility   ENUM('public','private')       NOT NULL DEFAULT 'public',
    invite_code  VARCHAR(20)                    NULL COMMENT 'Used for private groups; regenerate to invalidate',
    max_members  INT                            NOT NULL DEFAULT 100,
    member_count INT                            NOT NULL DEFAULT 1 COMMENT 'Denormalized; updated by trigger',
    category     VARCHAR(80)                    NULL,
    language     VARCHAR(10)                    NOT NULL DEFAULT 'vi',
    status       ENUM('active','archived','deleted') NOT NULL DEFAULT 'active',
    created_at   DATETIME                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME                       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_groups_invite_code (invite_code),
    INDEX   idx_groups_owner_id   (owner_id),
    INDEX   idx_groups_visibility (visibility),
    INDEX   idx_groups_status     (status),
    FULLTEXT INDEX ft_groups_search (name, description),
    CONSTRAINT fk_groups_owner FOREIGN KEY (owner_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Group members ─────────────────────────────────────────────────────────────
CREATE TABLE group_members (
    id          BINARY(16)                          NOT NULL ,
    group_id    BINARY(16)                          NOT NULL,
    user_id     BINARY(16)                          NOT NULL,
    role        ENUM('owner','editor','member')     NOT NULL DEFAULT 'member',
    status      ENUM('active','banned')             NOT NULL DEFAULT 'active',
    approved_by BINARY(16)                          NULL,
    joined_at   DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_group_members (group_id, user_id),
    INDEX   idx_gm_group_id (group_id),
    INDEX   idx_gm_user_id  (user_id),
    INDEX   idx_gm_role     (group_id, role),
    CONSTRAINT fk_gm_group       FOREIGN KEY (group_id)    REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user        FOREIGN KEY (user_id)     REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_approved_by FOREIGN KEY (approved_by) REFERENCES users        (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Join requests ─────────────────────────────────────────────────────────────
CREATE TABLE group_join_requests (
    id          BINARY(16)                          NOT NULL ,
    group_id    BINARY(16)                          NOT NULL,
    user_id     BINARY(16)                          NOT NULL,
    message     TEXT                                NULL,
    status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reviewed_by BINARY(16)                          NULL,
    created_at  DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME                            NULL,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_join_requests (group_id, user_id),
    INDEX   idx_jr_group_id (group_id, status),
    INDEX   idx_jr_user_id  (user_id),
    CONSTRAINT fk_jr_group       FOREIGN KEY (group_id)    REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_jr_user        FOREIGN KEY (user_id)     REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT fk_jr_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users        (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Group feed posts ──────────────────────────────────────────────────────────
CREATE TABLE group_feed_posts (
    id                 BINARY(16)                                                    NOT NULL ,
    group_id           BINARY(16)                                                    NOT NULL,
    author_id          BINARY(16)                                                    NOT NULL,
    content            TEXT                                                          NOT NULL,
    linked_entity_id   BINARY(16)                                                    NULL COMMENT 'Polymorphic FK to course/lesson/assignment/meeting/quiz',
    linked_entity_type ENUM('course','chapter','lesson','assignment','meeting','quiz') NULL,
    is_pinned          TINYINT(1)                                                    NOT NULL DEFAULT 0,
    reaction_count     INT                                                           NOT NULL DEFAULT 0,
    comment_count      INT                                                           NOT NULL DEFAULT 0,
    created_at         DATETIME                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_fp_group_id  (group_id, created_at DESC),
    INDEX   idx_fp_author_id (author_id),
    INDEX   idx_fp_pinned    (group_id, is_pinned),
    CONSTRAINT fk_fp_group  FOREIGN KEY (group_id)  REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_fp_author FOREIGN KEY (author_id) REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT chk_fp_linked CHECK (
        (linked_entity_id IS NULL AND linked_entity_type IS NULL)
        OR (linked_entity_id IS NOT NULL AND linked_entity_type IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Feed comments ─────────────────────────────────────────────────────────────
CREATE TABLE group_feed_comments (
    id           BINARY(16) NOT NULL ,
    feed_post_id BINARY(16) NOT NULL,
    author_id    BINARY(16) NOT NULL,
    content      TEXT       NOT NULL,
    created_at   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_fc_post_id (feed_post_id),
    CONSTRAINT fk_fc_post   FOREIGN KEY (feed_post_id) REFERENCES group_feed_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_fc_author FOREIGN KEY (author_id)    REFERENCES users            (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Feed reactions ────────────────────────────────────────────────────────────
CREATE TABLE group_feed_reactions (
    id           BINARY(16)  NOT NULL ,
    feed_post_id BINARY(16)  NOT NULL,
    user_id      BINARY(16)  NOT NULL,
    emoji        VARCHAR(10) NOT NULL DEFAULT '👍',
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_reactions (feed_post_id, user_id),
    INDEX   idx_fr_post_id (feed_post_id),
    CONSTRAINT fk_fr_post FOREIGN KEY (feed_post_id) REFERENCES group_feed_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_user FOREIGN KEY (user_id)      REFERENCES users            (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 5. COURSES
-- =============================================================================

CREATE TABLE courses (
    id                   BINARY(16)                                NOT NULL ,
    group_id             BINARY(16)                                NOT NULL,
    created_by           BINARY(16)                                NOT NULL,
    title                VARCHAR(200)                              NOT NULL,
    description          TEXT                                      NULL,
    thumbnail_key        CHAR(36)                                  NULL COMMENT 'MinIO object key (UUID) for course thumbnail',
    start_date           DATETIME                                  NULL,
    end_date             DATETIME                                  NULL,
    status               ENUM('draft','published','ended','archived') NOT NULL DEFAULT 'draft',
    completion_threshold TINYINT                                   NOT NULL DEFAULT 80,
    has_certificate      TINYINT(1)                                NOT NULL DEFAULT 0,
    certificate_key      CHAR(36)                                  NULL COMMENT 'MinIO object key (UUID) for certificate template',
    order_index          SMALLINT                                  NOT NULL DEFAULT 0,
    created_at           DATETIME                                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME                                  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_courses_group_id   (group_id),
    INDEX   idx_courses_status     (status),
    INDEX   idx_courses_created_by (created_by),
    CONSTRAINT fk_courses_group      FOREIGN KEY (group_id)   REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_courses_creator    FOREIGN KEY (created_by) REFERENCES users        (id) ON DELETE RESTRICT,
    CONSTRAINT chk_courses_threshold CHECK (completion_threshold BETWEEN 0 AND 100),
    CONSTRAINT chk_courses_dates     CHECK (end_date IS NULL OR end_date > start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Chapters ──────────────────────────────────────────────────────────────────
CREATE TABLE course_chapters (
    id                   BINARY(16)   NOT NULL ,
    course_id            BINARY(16)   NOT NULL,
    title                VARCHAR(200) NOT NULL,
    description          TEXT         NULL,
    order_index          SMALLINT     NOT NULL DEFAULT 0,
    is_locked            TINYINT(1)   NOT NULL DEFAULT 0,
    unlock_after_chapter BINARY(16)   NULL COMMENT 'Self-ref: unlocks after this chapter is completed',
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_chapters_course_id (course_id, order_index),
    CONSTRAINT fk_chapters_course  FOREIGN KEY (course_id)            REFERENCES courses        (id) ON DELETE CASCADE,
    CONSTRAINT fk_chapters_unlock  FOREIGN KEY (unlock_after_chapter) REFERENCES course_chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Lessons ───────────────────────────────────────────────────────────────────
CREATE TABLE course_lessons (
    id               BINARY(16)                                  NOT NULL ,
    chapter_id       BINARY(16)                                  NOT NULL,
    title            VARCHAR(200)                                NOT NULL,
    content_type     ENUM('video','document','embed','file')     NOT NULL DEFAULT 'document',
    content          LONGTEXT                                    NULL COMMENT 'Rich text or embed code',
    resource_key     CHAR(36)                                    NULL COMMENT 'MinIO object key (UUID) for video or file; NULL for embed/text lessons',
    duration_seconds INT                                         NULL,
    order_index      SMALLINT                                    NOT NULL DEFAULT 0,
    created_at       DATETIME                                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME                                    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_lessons_chapter_id (chapter_id, order_index),
    CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES course_chapters (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Course enrollments ────────────────────────────────────────────────────────
CREATE TABLE course_enrollments (
    id               BINARY(16) NOT NULL ,
    course_id        BINARY(16) NOT NULL,
    user_id          BINARY(16) NOT NULL,
    progress_percent TINYINT    NOT NULL DEFAULT 0,
    is_completed     TINYINT(1) NOT NULL DEFAULT 0,
    completed_at     DATETIME   NULL,
    enrolled_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_enrollments (course_id, user_id),
    INDEX   idx_enroll_course_id (course_id),
    INDEX   idx_enroll_user_id   (user_id),
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_user   FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT chk_enroll_progress CHECK (progress_percent BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Lesson-level progress ─────────────────────────────────────────────────────
CREATE TABLE lesson_progress (
    id                BINARY(16) NOT NULL ,
    enrollment_id     BINARY(16) NOT NULL,
    lesson_id         BINARY(16) NOT NULL,
    is_completed      TINYINT(1) NOT NULL DEFAULT 0,
    last_position_sec INT        NOT NULL DEFAULT 0 COMMENT 'Video resume position in seconds',
    completed_at      DATETIME   NULL,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_lesson_progress (enrollment_id, lesson_id),
    INDEX   idx_lp_enrollment_id (enrollment_id),
    INDEX   idx_lp_lesson_id     (lesson_id),
    CONSTRAINT fk_lp_enrollment FOREIGN KEY (enrollment_id) REFERENCES course_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_lesson     FOREIGN KEY (lesson_id)     REFERENCES course_lessons     (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 6. QUIZZES
-- =============================================================================

CREATE TABLE quizzes (
    id                BINARY(16)                                   NOT NULL ,
    course_id         BINARY(16)                                   NOT NULL,
    chapter_id        BINARY(16)                                   NULL,
    title             VARCHAR(200)                                 NOT NULL,
    description       TEXT                                         NULL,
    time_limit_sec    INT                                          NULL COMMENT 'NULL = unlimited',
    max_attempts      TINYINT                                      NOT NULL DEFAULT 1,
    passing_score     TINYINT                                      NOT NULL DEFAULT 50,
    shuffle_questions TINYINT(1)                                   NOT NULL DEFAULT 0,
    result_visibility ENUM('immediate','after_deadline','manual')  NOT NULL DEFAULT 'immediate',
    created_by        BINARY(16)                                   NULL,
    created_at        DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_quizzes_course_id  (course_id),
    INDEX   idx_quizzes_chapter_id (chapter_id),
    CONSTRAINT fk_quizzes_course  FOREIGN KEY (course_id)  REFERENCES courses         (id) ON DELETE CASCADE,
    CONSTRAINT fk_quizzes_chapter FOREIGN KEY (chapter_id) REFERENCES course_chapters (id) ON DELETE SET NULL,
    CONSTRAINT fk_quizzes_creator FOREIGN KEY (created_by) REFERENCES users           (id) ON DELETE SET NULL,
    CONSTRAINT chk_quizzes_score  CHECK (passing_score BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Questions ─────────────────────────────────────────────────────────────────
CREATE TABLE quiz_questions (
    id            BINARY(16)                                                            NOT NULL ,
    quiz_id       BINARY(16)                                                            NOT NULL,
    content       TEXT                                                                  NOT NULL,
    question_type ENUM('single_choice','multiple_choice','true_false','fill_blank','short_answer')
                                                                                        NOT NULL DEFAULT 'single_choice',
    points        SMALLINT                                                              NOT NULL DEFAULT 1,
    explanation   TEXT                                                                  NULL COMMENT 'Shown to student after submission',
    order_index   SMALLINT                                                              NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX   idx_questions_quiz_id (quiz_id, order_index),
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
    CONSTRAINT chk_questions_points CHECK (points > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Answers (options for choice / T-F questions) ──────────────────────────────
CREATE TABLE quiz_answers (
    id          BINARY(16) NOT NULL ,
    question_id BINARY(16) NOT NULL,
    content     TEXT       NOT NULL,
    is_correct  TINYINT(1) NOT NULL DEFAULT 0,
    order_index SMALLINT   NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX   idx_answers_question_id (question_id),
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Attempts ──────────────────────────────────────────────────────────────────
CREATE TABLE quiz_attempts (
    id             BINARY(16) NOT NULL ,
    quiz_id        BINARY(16) NOT NULL,
    user_id        BINARY(16) NOT NULL,
    score          SMALLINT   NULL COMMENT 'NULL until submitted',
    attempt_number TINYINT    NOT NULL DEFAULT 1,
    is_passed      TINYINT(1) NULL COMMENT 'NULL until scored',
    started_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at   DATETIME   NULL,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_attempts (quiz_id, user_id, attempt_number),
    INDEX   idx_attempts_quiz_id  (quiz_id),
    INDEX   idx_attempts_user_id  (user_id),
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id)  REFERENCES quizzes (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id)  REFERENCES users   (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Responses (one row per question per attempt) ──────────────────────────────
CREATE TABLE quiz_responses (
    id                 BINARY(16) NOT NULL ,
    attempt_id         BINARY(16) NOT NULL,
    question_id        BINARY(16) NOT NULL,
    selected_answer_id BINARY(16) NULL COMMENT 'For choice-type questions',
    text_response      TEXT       NULL COMMENT 'For fill_blank / short_answer',
    is_correct         TINYINT(1) NULL,
    points_earned      SMALLINT   NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_responses (attempt_id, question_id),
    INDEX   idx_responses_attempt_id (attempt_id),
    CONSTRAINT fk_responses_attempt  FOREIGN KEY (attempt_id)         REFERENCES quiz_attempts  (id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_question FOREIGN KEY (question_id)        REFERENCES quiz_questions (id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_answer   FOREIGN KEY (selected_answer_id) REFERENCES quiz_answers   (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 7. ASSIGNMENTS
-- =============================================================================

CREATE TABLE assignments (
    id                   BINARY(16)                            NOT NULL ,
    group_id             BINARY(16)                            NOT NULL,
    course_id            BINARY(16)                            NULL COMMENT 'Optional link to a course',
    created_by           BINARY(16)                            NOT NULL,
    title                VARCHAR(200)                          NOT NULL,
    description          TEXT                                  NULL,
    max_score            SMALLINT                              NOT NULL DEFAULT 100,
    assigned_at          DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at               DATETIME                              NOT NULL,
    submission_type      ENUM('file','text','url','mixed')     NOT NULL DEFAULT 'file',
    allowed_file_types   VARCHAR(255)                          NULL COMMENT 'e.g. .pdf,.docx,.zip',
    max_file_size_mb     SMALLINT                              NOT NULL DEFAULT 50,
    allow_late           TINYINT(1)                            NOT NULL DEFAULT 0,
    late_penalty_percent TINYINT                               NOT NULL DEFAULT 0,
    status               ENUM('draft','published','closed')    NOT NULL DEFAULT 'draft',
    created_at           DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_asgn_group_id   (group_id),
    INDEX   idx_asgn_course_id  (course_id),
    INDEX   idx_asgn_created_by (created_by),
    INDEX   idx_asgn_due_at     (due_at),
    INDEX   idx_asgn_status     (status),
    CONSTRAINT fk_asgn_group      FOREIGN KEY (group_id)   REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_asgn_course     FOREIGN KEY (course_id)  REFERENCES courses      (id) ON DELETE SET NULL,
    CONSTRAINT fk_asgn_creator    FOREIGN KEY (created_by) REFERENCES users        (id) ON DELETE RESTRICT,
    CONSTRAINT chk_asgn_score     CHECK (max_score > 0),
    CONSTRAINT chk_asgn_penalty   CHECK (late_penalty_percent BETWEEN 0 AND 100),
    CONSTRAINT chk_asgn_dates     CHECK (due_at > assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Submissions ───────────────────────────────────────────────────────────────
CREATE TABLE assignment_submissions (
    id              BINARY(16)                         NOT NULL ,
    assignment_id   BINARY(16)                         NOT NULL,
    student_id      BINARY(16)                         NOT NULL,
    submission_type ENUM('file','text','url','mixed')  NOT NULL DEFAULT 'file',
    text_content    LONGTEXT                           NULL,
    file_key        CHAR(36)                           NULL COMMENT 'MinIO object key (UUID) for submitted file',
    file_name       VARCHAR(255)                       NULL COMMENT 'Original filename shown to student',
    file_size       INT                                NULL COMMENT 'bytes',
    external_url    TEXT                               NULL COMMENT 'For url submission_type; public URL is acceptable here',
    is_late         TINYINT(1)                         NOT NULL DEFAULT 0,
    attempt_number  TINYINT                            NOT NULL DEFAULT 1,
    submitted_at    DATETIME                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_sub_assignment_id (assignment_id),
    INDEX   idx_sub_student_id    (student_id),
    INDEX   idx_sub_submitted_at  (submitted_at DESC),
    CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_student    FOREIGN KEY (student_id)    REFERENCES users       (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='attempt_number increments each re-submission before deadline.';


-- ── Grades ────────────────────────────────────────────────────────────────────
CREATE TABLE assignment_grades (
    id                BINARY(16)                            NOT NULL ,
    submission_id     BINARY(16)                            NOT NULL,
    grader_id         BINARY(16)                            NOT NULL,
    score             SMALLINT                              NOT NULL,
    feedback          TEXT                                  NULL,
    feedback_key      CHAR(36)                              NULL COMMENT 'MinIO object key (UUID) for feedback file attachment',
    status            ENUM('pending','graded','returned')   NOT NULL DEFAULT 'graded',
    graded_at         DATETIME                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_grades_submission (submission_id),
    INDEX   idx_grades_grader_id (grader_id),
    CONSTRAINT fk_grades_submission FOREIGN KEY (submission_id) REFERENCES assignment_submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_grader     FOREIGN KEY (grader_id)     REFERENCES users                 (id) ON DELETE RESTRICT,
    CONSTRAINT chk_grades_score     CHECK (score >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 8. MEETINGS
-- =============================================================================

CREATE TABLE meetings (
    id               BINARY(16)                                        NOT NULL ,
    group_id         BINARY(16)                                        NOT NULL,
    created_by       BINARY(16)                                        NOT NULL,
    title            VARCHAR(200)                                      NOT NULL,
    description      TEXT                                              NULL,
    meeting_type     ENUM('video_conference','webinar','recording_only') NOT NULL DEFAULT 'video_conference',
    platform         VARCHAR(50)                                       NULL COMMENT 'zoom | google_meet | teams | jitsi',
    join_url         TEXT                                              NULL COMMENT 'External platform URL; not stored in MinIO',
    passcode         VARCHAR(50)                                       NULL,
    recording_key    CHAR(36)                                          NULL COMMENT 'MinIO object key (UUID) for recorded session file',
    start_at         DATETIME                                          NOT NULL,
    duration_minutes SMALLINT                                          NOT NULL DEFAULT 60,
    status           ENUM('scheduled','live','ended','cancelled')      NOT NULL DEFAULT 'scheduled',
    created_at       DATETIME                                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME                                          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_meetings_group_id   (group_id),
    INDEX   idx_meetings_start_at   (start_at),
    INDEX   idx_meetings_status     (status),
    INDEX   idx_meetings_created_by (created_by),
    CONSTRAINT fk_meetings_group   FOREIGN KEY (group_id)   REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_creator FOREIGN KEY (created_by) REFERENCES users        (id) ON DELETE RESTRICT,
    CONSTRAINT chk_meetings_dur    CHECK (duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Attendance log ────────────────────────────────────────────────────────────
CREATE TABLE meeting_attendances (
    id           BINARY(16) NOT NULL ,
    meeting_id   BINARY(16) NOT NULL,
    user_id      BINARY(16) NOT NULL,
    joined_at    DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at      DATETIME   NULL,
    duration_sec INT        NOT NULL DEFAULT 0,
    is_present   TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_attendance (meeting_id, user_id),
    INDEX   idx_att_meeting_id (meeting_id),
    INDEX   idx_att_user_id    (user_id),
    CONSTRAINT fk_att_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE,
    CONSTRAINT fk_att_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── In-meeting polls ──────────────────────────────────────────────────────────
CREATE TABLE meeting_polls (
    id         BINARY(16) NOT NULL ,
    meeting_id BINARY(16) NOT NULL,
    question   TEXT       NOT NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_polls_meeting_id (meeting_id),
    CONSTRAINT fk_polls_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Poll options ──────────────────────────────────────────────────────────────
CREATE TABLE meeting_poll_options (
    id         BINARY(16)   NOT NULL ,
    poll_id    BINARY(16)   NOT NULL,
    label      VARCHAR(200) NOT NULL,
    vote_count INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX   idx_poll_opts_poll_id (poll_id),
    CONSTRAINT fk_poll_opts_poll FOREIGN KEY (poll_id) REFERENCES meeting_polls (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Poll votes ────────────────────────────────────────────────────────────────
CREATE TABLE meeting_poll_votes (
    poll_id   BINARY(16) NOT NULL,
    option_id BINARY(16) NOT NULL,
    user_id   BINARY(16) NOT NULL,
    PRIMARY KEY (poll_id, user_id),
    INDEX   idx_pv_option_id (option_id),
    CONSTRAINT fk_pv_poll   FOREIGN KEY (poll_id)   REFERENCES meeting_polls        (id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_option FOREIGN KEY (option_id) REFERENCES meeting_poll_options (id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_user   FOREIGN KEY (user_id)   REFERENCES users                (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 9. CALENDAR EVENTS
-- =============================================================================

CREATE TABLE calendar_events (
    id                 BINARY(16)                                                NOT NULL ,
    user_id            BINARY(16)                                                NOT NULL,
    title              VARCHAR(200)                                              NOT NULL,
    description        TEXT                                                      NULL,
    start_at           DATETIME                                                  NOT NULL,
    end_at             DATETIME                                                  NULL,
    event_type         ENUM('meeting','assignment_due','quiz','course_start','course_end','personal','system')
                                                                                 NOT NULL,
    color              CHAR(7)                                                   NOT NULL DEFAULT '#6366F1',
    source_entity_id   BINARY(16)                                                NULL COMMENT 'Polymorphic back-ref to assignment/meeting/quiz/course',
    source_entity_type ENUM('meeting','assignment','quiz','course')              NULL,
    is_personal        TINYINT(1)                                                NOT NULL DEFAULT 0,
    reminder_at        DATETIME                                                  NULL,
    created_at         DATETIME                                                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX   idx_cal_user_id   (user_id, start_at),
    INDEX   idx_cal_type      (user_id, event_type),
    INDEX   idx_cal_reminder  (reminder_at),
    INDEX   idx_cal_source    (source_entity_id, source_entity_type),
    CONSTRAINT fk_cal_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_cal_dates   CHECK (end_at IS NULL OR end_at >= start_at),
    CONSTRAINT chk_cal_linked  CHECK (
        (source_entity_id IS NULL AND source_entity_type IS NULL)
        OR (source_entity_id IS NOT NULL AND source_entity_type IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Materialized per-user events. Updated by application service on source changes.';


-- =============================================================================
-- 10. NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
    id                 BINARY(16)                                                           NOT NULL ,
    recipient_id       BINARY(16)                                                           NOT NULL,
    title              VARCHAR(200)                                                         NOT NULL,
    body               TEXT                                                                 NULL,
    type               ENUM(
                           'join_request','join_approved','join_rejected',
                           'new_assignment','assignment_due_soon','assignment_graded',
                           'new_meeting','meeting_starting_soon',
                           'new_course','forum_reply','mention','content_reported','system'
                       )                                                                    NOT NULL,
    action_url         TEXT                                                                 NULL COMMENT 'Deep-link within the app; not a MinIO object',
    source_entity_id   BINARY(16)                                                           NULL,
    source_entity_type VARCHAR(60)                                                          NULL,
    is_read            TINYINT(1)                                                           NOT NULL DEFAULT 0,
    created_at         DATETIME                                                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at            DATETIME                                                             NULL,
    PRIMARY KEY (id),
    INDEX   idx_notif_recipient (recipient_id, is_read, created_at DESC),
    INDEX   idx_notif_type      (type),
    INDEX   idx_notif_created   (created_at DESC),
    INDEX   idx_notif_unread    (recipient_id, is_read),
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 11. TRIGGERS
-- =============================================================================

DELIMITER $$

-- ── Sync group member_count on INSERT ─────────────────────────────────────────
CREATE TRIGGER trg_gm_count_insert
AFTER INSERT ON group_members
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE study_groups
        SET    member_count = member_count + 1
        WHERE  id = NEW.group_id;
    END IF;
END$$

-- ── Sync group member_count on DELETE ─────────────────────────────────────────
CREATE TRIGGER trg_gm_count_delete
AFTER DELETE ON group_members
FOR EACH ROW
BEGIN
    IF OLD.status = 'active' THEN
        UPDATE study_groups
        SET    member_count = GREATEST(member_count - 1, 0)
        WHERE  id = OLD.group_id;
    END IF;
END$$

-- ── Sync group member_count on UPDATE (status change) ─────────────────────────
CREATE TRIGGER trg_gm_count_update
AFTER UPDATE ON group_members
FOR EACH ROW
BEGIN
    IF OLD.status <> 'active' AND NEW.status = 'active' THEN
        UPDATE study_groups SET member_count = member_count + 1
        WHERE id = NEW.group_id;
    ELSEIF OLD.status = 'active' AND NEW.status <> 'active' THEN
        UPDATE study_groups SET member_count = GREATEST(member_count - 1, 0)
        WHERE id = OLD.group_id;
    END IF;
END$$

-- ── Sync forum upvote_count on vote INSERT ────────────────────────────────────
CREATE TRIGGER trg_vote_insert
AFTER INSERT ON forum_votes
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'forum_post' THEN
        UPDATE forum_posts    SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
    ELSE
        UPDATE forum_comments SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
    END IF;
END$$

-- ── Sync forum upvote_count on vote DELETE ────────────────────────────────────
CREATE TRIGGER trg_vote_delete
AFTER DELETE ON forum_votes
FOR EACH ROW
BEGIN
    IF OLD.target_type = 'forum_post' THEN
        UPDATE forum_posts    SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.target_id;
    ELSE
        UPDATE forum_comments SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
END$$

-- ── Sync feed reaction_count ──────────────────────────────────────────────────
CREATE TRIGGER trg_reaction_insert
AFTER INSERT ON group_feed_reactions
FOR EACH ROW
BEGIN
    UPDATE group_feed_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.feed_post_id;
END$$

CREATE TRIGGER trg_reaction_delete
AFTER DELETE ON group_feed_reactions
FOR EACH ROW
BEGIN
    UPDATE group_feed_posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.feed_post_id;
END$$

-- ── Sync feed comment_count ───────────────────────────────────────────────────
CREATE TRIGGER trg_feed_comment_insert
AFTER INSERT ON group_feed_comments
FOR EACH ROW
BEGIN
    UPDATE group_feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.feed_post_id;
END$$

CREATE TRIGGER trg_feed_comment_delete
AFTER DELETE ON group_feed_comments
FOR EACH ROW
BEGIN
    UPDATE group_feed_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.feed_post_id;
END$$

-- ── Sync forum tag post_count ─────────────────────────────────────────────────
CREATE TRIGGER trg_tag_count_insert
AFTER INSERT ON forum_post_tags
FOR EACH ROW
BEGIN
    UPDATE forum_tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
END$$

CREATE TRIGGER trg_tag_count_delete
AFTER DELETE ON forum_post_tags
FOR EACH ROW
BEGIN
    UPDATE forum_tags SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.tag_id;
END$$

-- ── Sync meeting poll vote_count ──────────────────────────────────────────────
CREATE TRIGGER trg_poll_vote_insert
AFTER INSERT ON meeting_poll_votes
FOR EACH ROW
BEGIN
    UPDATE meeting_poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
END$$

CREATE TRIGGER trg_poll_vote_delete
AFTER DELETE ON meeting_poll_votes
FOR EACH ROW
BEGIN
    UPDATE meeting_poll_options SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.option_id;
END$$

DELIMITER ;


-- =============================================================================
-- 12. VIEWS
-- =============================================================================

-- ── Active group members with user details ────────────────────────────────────
-- NOTE: BINARY(16) IDs are exposed as human-readable strings via bin_to_uuid16()
CREATE VIEW v_group_members_detail AS
SELECT
    bin_to_uuid16(gm.group_id)  AS group_id,
    bin_to_uuid16(gm.user_id)   AS user_id,
    gm.role,
    gm.status,
    gm.joined_at,
    u.full_name,
    u.avatar_key,
    u.email,
    u.role AS platform_role
FROM  group_members gm
JOIN  users         u  ON u.id = gm.user_id
WHERE gm.status = 'active';


-- ── Student assignment status overview ───────────────────────────────────────
CREATE VIEW v_assignment_status AS
SELECT
    bin_to_uuid16(a.id)          AS assignment_id,
    bin_to_uuid16(a.group_id)    AS group_id,
    a.title                      AS assignment_title,
    a.due_at,
    bin_to_uuid16(u.id)          AS student_id,
    u.full_name,
    bin_to_uuid16(s.id)          AS submission_id,
    s.submitted_at,
    s.is_late,
    g.score,
    g.status                     AS grade_status,
    CASE
        WHEN s.id     IS NULL          THEN 'not_submitted'
        WHEN g.id     IS NULL          THEN 'submitted_ungraded'
        WHEN g.status = 'returned'     THEN 'returned'
        ELSE 'graded'
    END                          AS overall_status
FROM  assignments            a
JOIN  study_groups           sg ON sg.id = a.group_id
JOIN  group_members          gm ON gm.group_id = sg.id
                                AND gm.status   = 'active'
                                AND gm.role     = 'member'
JOIN  users                  u  ON u.id = gm.user_id
LEFT JOIN assignment_submissions s
       ON s.assignment_id  = a.id
      AND s.student_id     = u.id
      AND s.attempt_number = (
          SELECT MAX(s2.attempt_number)
          FROM   assignment_submissions s2
          WHERE  s2.assignment_id = a.id AND s2.student_id = u.id
      )
LEFT JOIN assignment_grades  g ON g.submission_id = s.id;


-- ── Per-user upcoming events (next 30 days) ───────────────────────────────────
CREATE VIEW v_upcoming_events AS
SELECT
    bin_to_uuid16(id)      AS id,
    bin_to_uuid16(user_id) AS user_id,
    title,
    description,
    start_at,
    end_at,
    event_type,
    color,
    is_personal,
    reminder_at,
    created_at
FROM   calendar_events
WHERE  start_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
ORDER  BY start_at ASC;


-- =============================================================================
-- END OF SCRIPT
-- =============================================================================


-- Sửa lỗi định dạng enum
-- 1. USERS
ALTER TABLE users
  MODIFY COLUMN role ENUM('ADMIN','INSTRUCTOR','STUDENT') NOT NULL DEFAULT 'STUDENT',
  MODIFY COLUMN status ENUM('PENDING','ACTIVE','SUSPENDED','DELETED') NOT NULL DEFAULT 'PENDING';

-- 2. FORUM
ALTER TABLE forum_posts
  MODIFY COLUMN status ENUM('DRAFT','PUBLISHED','HIDDEN','DELETED') NOT NULL DEFAULT 'PUBLISHED';

ALTER TABLE forum_votes
  MODIFY COLUMN target_type ENUM('FORUM_POST','FORUM_COMMENT') NOT NULL,
  MODIFY COLUMN vote_type ENUM('UPVOTE','DOWNVOTE') NOT NULL DEFAULT 'UPVOTE';

-- 3. STUDY GROUPS
ALTER TABLE study_groups
  MODIFY COLUMN visibility ENUM('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  MODIFY COLUMN status ENUM('ACTIVE','ARCHIVED','DELETED') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE group_members
  MODIFY COLUMN role ENUM('OWNER','EDITOR','MEMBER') NOT NULL DEFAULT 'MEMBER',
  MODIFY COLUMN status ENUM('ACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE group_join_requests
  MODIFY COLUMN status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE group_feed_posts
  MODIFY COLUMN linked_entity_type ENUM('COURSE','CHAPTER','LESSON','ASSIGNMENT','MEETING','QUIZ') NULL;

-- 4. COURSES
ALTER TABLE courses
  MODIFY COLUMN status ENUM('DRAFT','PUBLISHED','ENDED','ARCHIVED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE course_lessons
  MODIFY COLUMN content_type ENUM('VIDEO','DOCUMENT','EMBED','FILE') NOT NULL DEFAULT 'DOCUMENT';

-- 5. QUIZZES
ALTER TABLE quizzes
  MODIFY COLUMN result_visibility ENUM('IMMEDIATE','AFTER_DEADLINE','MANUAL') NOT NULL DEFAULT 'IMMEDIATE';

ALTER TABLE quiz_questions
  MODIFY COLUMN question_type ENUM('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_BLANK','SHORT_ANSWER') NOT NULL DEFAULT 'SINGLE_CHOICE';

-- 6. ASSIGNMENTS
ALTER TABLE assignments
  MODIFY COLUMN submission_type ENUM('FILE','TEXT','URL','MIXED') NOT NULL DEFAULT 'FILE',
  MODIFY COLUMN status ENUM('DRAFT','PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE assignment_submissions
  MODIFY COLUMN submission_type ENUM('FILE','TEXT','URL','MIXED') NOT NULL DEFAULT 'FILE';

ALTER TABLE assignment_grades
  MODIFY COLUMN status ENUM('PENDING','GRADED','RETURNED') NOT NULL DEFAULT 'GRADED';

-- 7. MEETINGS
ALTER TABLE meetings
  MODIFY COLUMN meeting_type ENUM('VIDEO_CONFERENCE','WEBINAR','RECORDING_ONLY') NOT NULL DEFAULT 'VIDEO_CONFERENCE',
  MODIFY COLUMN status ENUM('SCHEDULED','LIVE','ENDED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED';

-- 8. CALENDAR EVENTS
ALTER TABLE calendar_events
  MODIFY COLUMN event_type ENUM('MEETING','ASSIGNMENT_DUE','QUIZ','COURSE_START','COURSE_END','PERSONAL','SYSTEM') NOT NULL,
  MODIFY COLUMN source_entity_type ENUM('MEETING','ASSIGNMENT','QUIZ','COURSE') NULL;

-- 9. NOTIFICATIONS
ALTER TABLE notifications
  MODIFY COLUMN type ENUM('JOIN_REQUEST','JOIN_APPROVED','JOIN_REJECTED','NEW_ASSIGNMENT','ASSIGNMENT_DUE_SOON','ASSIGNMENT_GRADED','NEW_MEETING','MEETING_STARTING_SOON','NEW_COURSE','FORUM_REPLY','MENTION','CONTENT_REPORTED','SYSTEM') NOT NULL;
