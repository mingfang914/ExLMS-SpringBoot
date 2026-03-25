package project.TeamFive.ExLMS.forum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.forum.dto.request.CommentRequest;
import project.TeamFive.ExLMS.forum.dto.response.ForumCommentResponse;
import project.TeamFive.ExLMS.forum.entity.ForumComment;
import project.TeamFive.ExLMS.forum.entity.ForumPost;
import project.TeamFive.ExLMS.forum.repository.ForumCommentRepository;
import project.TeamFive.ExLMS.forum.repository.ForumPostRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumCommentService {

    private final ForumCommentRepository commentRepository;
    private final ForumPostRepository postRepository;

    @Transactional
    public ForumCommentResponse addComment(UUID postId, CommentRequest request, User author) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        ForumComment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            
            // Check depth (Max 3 as per requirement)
            int depth = calculateDepth(parent);
            if (depth >= 3) {
                throw new RuntimeException("Bình luận tối đa 3 cấp!");
            }
        }

        ForumComment comment = ForumComment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .content(request.getContent())
                .build();

        return ForumCommentResponse.fromEntity(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<ForumCommentResponse> getCommentsByPost(UUID postId) {
        return commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAtAsc(postId)
                .stream()
                .map(ForumCommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsAccepted(UUID commentId, User user) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        ForumPost post = comment.getPost();
        
        // Only author of post or Admin/Instructor can mark accepted
        boolean isAuthor = post.getAuthor().getId().equals(user.getId());
        boolean isStaff = "ADMIN".equals(user.getRole().name()) || "INSTRUCTOR".equals(user.getRole().name());
        
        if (!isAuthor && !isStaff) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này!");
        }

        // Reset other accepted comments for this post
        // (Assuming only one accepted answer allowed)
        // Note: This logic could be improved to find existing accepted and reset
        comment.setAccepted(true);
        commentRepository.save(comment);
    }

    private int calculateDepth(ForumComment comment) {
        int depth = 1;
        ForumComment current = comment;
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
        }
        return depth;
    }
}
