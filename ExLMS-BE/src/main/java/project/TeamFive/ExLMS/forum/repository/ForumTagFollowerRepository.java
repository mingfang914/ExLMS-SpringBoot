package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumTagFollower;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumTagFollowerRepository extends JpaRepository<ForumTagFollower, ForumTagFollower.TagFollowerId> {
    List<ForumTagFollower> findByUserId(UUID userId);
    boolean existsByUserIdAndTagId(UUID userId, UUID tagId);
    void deleteByUserIdAndTagId(UUID userId, UUID tagId);
}
