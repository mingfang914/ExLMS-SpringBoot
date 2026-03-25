package project.TeamFive.ExLMS.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.forum.entity.ForumVote;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForumVoteRepository extends JpaRepository<ForumVote, UUID> {
    Optional<ForumVote> findByUserIdAndTargetIdAndTargetType(UUID userId, UUID targetId, ForumVote.TargetType targetType);
    int countByTargetIdAndTargetTypeAndVoteType(UUID targetId, ForumVote.TargetType targetType, ForumVote.VoteType voteType);
}
