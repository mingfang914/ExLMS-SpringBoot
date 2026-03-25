package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumSavedPost;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumSavedPostRepository extends JpaRepository<ForumSavedPost, ForumSavedPost.SavedPostId> {
    List<ForumSavedPost> findByUserIdOrderBySavedAtDesc(UUID userId);
    boolean existsByUserIdAndPostId(UUID userId, UUID postId);
    void deleteByUserIdAndPostId(UUID userId, UUID postId);
}
