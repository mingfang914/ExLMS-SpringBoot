package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupFeedComment;
import project.TeamFive.ExLMS.group.entity.GroupFeedPost;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroupFeedCommentRepository extends JpaRepository<GroupFeedComment, UUID> {
    List<GroupFeedComment> findByFeedPostOrderByCreatedAtAsc(GroupFeedPost post);
}
