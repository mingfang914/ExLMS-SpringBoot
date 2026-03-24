package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupFeedPost;
import project.TeamFive.ExLMS.group.entity.GroupFeedReaction;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupFeedReactionRepository extends JpaRepository<GroupFeedReaction, UUID> {
    Optional<GroupFeedReaction> findByFeedPostAndUser(GroupFeedPost post, User user);
    int countByFeedPost(GroupFeedPost post);
}
