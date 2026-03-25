package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumComment;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {
    List<ForumComment> findByPost_IdAndParentIsNullOrderByCreatedAtAsc(UUID postId);
    List<ForumComment> findByParent_IdOrderByCreatedAtAsc(UUID parentId);
}
