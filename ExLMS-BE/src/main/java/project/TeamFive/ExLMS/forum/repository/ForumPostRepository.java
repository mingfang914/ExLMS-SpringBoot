package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumPost;

import java.util.UUID;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, UUID>, JpaSpecificationExecutor<ForumPost> {
}
