package project.TeamFive.ExLMS.forum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.forum.dto.request.VoteRequest;
import project.TeamFive.ExLMS.forum.entity.ForumComment;
import project.TeamFive.ExLMS.forum.entity.ForumPost;
import project.TeamFive.ExLMS.forum.entity.ForumVote;
import project.TeamFive.ExLMS.forum.repository.ForumCommentRepository;
import project.TeamFive.ExLMS.forum.repository.ForumPostRepository;
import project.TeamFive.ExLMS.forum.repository.ForumVoteRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForumVoteService {

    private final ForumVoteRepository voteRepository;
    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;

    @Transactional
    public void vote(UUID targetId, ForumVote.TargetType targetType, VoteRequest request, User user) {
        Optional<ForumVote> existingVote = voteRepository.findByUserIdAndTargetIdAndTargetType(
                user.getId(), targetId, targetType);

        if (existingVote.isPresent()) {
            ForumVote vote = existingVote.get();
            if (vote.getVoteType() == request.getVoteType()) {
                // Remove vote if same type clicked again (Toggle)
                voteRepository.delete(vote);
                updateCounter(targetId, targetType, request.getVoteType(), -1);
            } else {
                // Change vote type
                ForumVote.VoteType oldType = vote.getVoteType();
                vote.setVoteType(request.getVoteType());
                voteRepository.save(vote);
                updateCounter(targetId, targetType, oldType, -1);
                updateCounter(targetId, targetType, request.getVoteType(), 1);
            }
        } else {
            // New vote
            ForumVote vote = ForumVote.builder()
                    .user(user)
                    .targetId(targetId)
                    .targetType(targetType)
                    .voteType(request.getVoteType())
                    .build();
            voteRepository.save(vote);
            updateCounter(targetId, targetType, request.getVoteType(), 1);
        }
    }

    private void updateCounter(UUID targetId, ForumVote.TargetType targetType, ForumVote.VoteType voteType, int delta) {
        // We only care about upvote_count in entities for now as per schema
        if (voteType != ForumVote.VoteType.UPVOTE) return;

        if (targetType == ForumVote.TargetType.FORUM_POST) {
            ForumPost post = postRepository.findById(targetId).orElseThrow();
            post.setUpvoteCount(post.getUpvoteCount() + delta);
            postRepository.save(post);
        } else if (targetType == ForumVote.TargetType.FORUM_COMMENT) {
            ForumComment comment = commentRepository.findById(targetId).orElseThrow();
            comment.setUpvoteCount(comment.getUpvoteCount() + delta);
            commentRepository.save(comment);
        }
    }
}
