package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.forum.entity.ForumTag;

import java.util.Optional;
import java.util.UUID;

public interface ForumTagRepository extends JpaRepository<ForumTag, UUID> {
    Optional<ForumTag> findBySlug(String slug);
}
