package project.TeamFive.ExLMS.group.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.UUID;

@Entity
@Table(name = "group_feed_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupFeedPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "linked_entity_id")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
    private UUID linkedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "linked_entity_type")
    private LinkedEntityType linkedEntityType;

    @Column(name = "is_pinned", nullable = false)
    private boolean pinned = false;

    @Column(name = "reaction_count", nullable = false)
    private int reactionCount = 0;

    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;

    public enum LinkedEntityType {
        COURSE, CHAPTER, LESSON, ASSIGNMENT, MEETING, QUIZ
    }
}
