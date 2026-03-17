package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.forum.entity.ForumPost;

import java.util.UUID;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
}
