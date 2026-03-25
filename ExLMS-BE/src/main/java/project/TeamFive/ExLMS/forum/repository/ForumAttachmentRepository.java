package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumAttachment;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumAttachmentRepository extends JpaRepository<ForumAttachment, UUID> {
    List<ForumAttachment> findByPost_Id(UUID postId);
}
