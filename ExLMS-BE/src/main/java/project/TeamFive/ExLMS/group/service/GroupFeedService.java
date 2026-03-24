package project.TeamFive.ExLMS.group.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.dto.request.GroupCommentRequest;
import project.TeamFive.ExLMS.group.dto.request.GroupFeedPostRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupCommentResponse;
import project.TeamFive.ExLMS.group.dto.response.GroupFeedPostResponse;
import project.TeamFive.ExLMS.group.entity.*;
import project.TeamFive.ExLMS.group.repository.*;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupFeedService {

    private final GroupFeedPostRepository feedPostRepository;
    private final GroupFeedCommentRepository feedCommentRepository;
    private final GroupFeedReactionRepository feedReactionRepository;
    private final StudyGroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    private void requireGroupMember(StudyGroup group, User user) {
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Truy cập bị từ chối: Bạn không phải là thành viên của nhóm này!");
        }
    }

    @Transactional(readOnly = true)
    public Page<GroupFeedPostResponse> getGroupFeed(UUID groupId, String type, Pageable pageable) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User currentUser = null;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                currentUser = (User) principal;
            }
            if (currentUser != null) {
                requireGroupMember(group, currentUser);
            }
        } catch (Exception e) {}

        if (type != null && !type.trim().isEmpty()) {
            if ("NOTICE".equalsIgnoreCase(type)) {
                return feedPostRepository.findByGroupAndPinnedIsTrueOrderByCreatedAtDesc(group, pageable)
                        .map(this::mapToResponse);
            }
            try {
                GroupFeedPost.LinkedEntityType entityType = GroupFeedPost.LinkedEntityType.valueOf(type.toUpperCase());
                return feedPostRepository.findByGroupAndLinkedEntityTypeOrderByPinnedDescCreatedAtDesc(group, entityType, pageable)
                        .map(this::mapToResponse);
            } catch (IllegalArgumentException e) {
                // Ignore invalid type
            }
        }

        return feedPostRepository.findByGroupOrderByPinnedDescCreatedAtDesc(group, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public GroupFeedPostResponse createPost(UUID groupId, GroupFeedPostRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        requireGroupMember(group, currentUser);

        GroupFeedPost post = GroupFeedPost.builder()
                .group(group)
                .author(currentUser)
                .content(request.getContent())
                .linkedEntityId(request.getLinkedEntityId())
                .linkedEntityType(request.getLinkedEntityType())
                .pinned(request.isPinned())
                .reactionCount(0)
                .commentCount(0)
                .build();

        return mapToResponse(feedPostRepository.save(post));
    }

    @Transactional
    public GroupFeedPostResponse updatePost(UUID postId, GroupFeedPostRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(post.getGroup().getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
            if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
                throw new RuntimeException("Chỉ người tạo hoặc Quản trị viên nhóm mới có quyền sửa bài viết này!");
            }
        }

        post.setContent(request.getContent());
        if (request.getLinkedEntityId() != null) post.setLinkedEntityId(request.getLinkedEntityId());
        if (request.getLinkedEntityType() != null) post.setLinkedEntityType(request.getLinkedEntityType());
        post.setPinned(request.isPinned());

        return mapToResponse(feedPostRepository.save(post));
    }

    @Transactional
    public String deletePost(UUID postId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(post.getGroup().getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
            if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
                throw new RuntimeException("Chỉ người tạo hoặc Quản trị viên nhóm mới có quyền xóa bài viết này!");
            }
        }
        
        feedCommentRepository.deleteAll(feedCommentRepository.findByFeedPostOrderByCreatedAtAsc(post));
        
        feedPostRepository.delete(post);
        return "Đã xóa bài viết khỏi feed.";
    }

    @Transactional
    public String togglePinPost(UUID postId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        GroupMember member = groupMemberRepository.findByGroupAndUser(post.getGroup(), currentUser)
            .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
            
        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException("Chỉ Quản trị viên nhóm mới có quyền ghim bài viết!");
        }
        
        post.setPinned(!post.isPinned());
        feedPostRepository.save(post);
        return post.isPinned() ? "Đã ghim bài viết." : "Đã bỏ ghim bài viết.";
    }

    @Transactional
    public GroupCommentResponse addComment(UUID postId, GroupCommentRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        requireGroupMember(post.getGroup(), currentUser);

        GroupFeedComment comment = GroupFeedComment.builder()
                .feedPost(post)
                .author(currentUser)
                .content(request.getContent())
                .build();

        GroupFeedComment savedComment = feedCommentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        feedPostRepository.save(post);

        return mapToCommentResponse(savedComment);
    }

    @Transactional
    public String deleteComment(UUID commentId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedComment comment = feedCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        GroupFeedPost post = comment.getFeedPost();

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(post.getGroup().getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
            if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
                throw new RuntimeException("Chỉ người tạo hoặc Quản trị viên nhóm mới có quyền xóa bình luận này!");
            }
        }

        feedCommentRepository.delete(comment);

        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        feedPostRepository.save(post);

        return "Đã xóa bình luận.";
    }

    @Transactional
    public String toggleReaction(UUID postId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        requireGroupMember(post.getGroup(), currentUser);

        Optional<GroupFeedReaction> existingReaction = feedReactionRepository.findByFeedPostAndUser(post, currentUser);

        if (existingReaction.isPresent()) {
            feedReactionRepository.delete(existingReaction.get());
            post.setReactionCount(Math.max(0, post.getReactionCount() - 1));
            feedPostRepository.save(post);
            return "Đã gỡ cảm xúc.";
        } else {
            GroupFeedReaction reaction = GroupFeedReaction.builder()
                    .feedPost(post)
                    .user(currentUser)
                    .emoji("👍")
                    .build();
            feedReactionRepository.save(reaction);
            post.setReactionCount(post.getReactionCount() + 1);
            feedPostRepository.save(post);
            return "Đã thả cảm xúc.";
        }
    }

    @Transactional(readOnly = true)
    public List<GroupCommentResponse> getPostComments(UUID postId) {
        GroupFeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = null;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                currentUser = (User) principal;
            }
            if (currentUser != null) {
                requireGroupMember(post.getGroup(), currentUser);
            }
        } catch (Exception e) {}

        return feedCommentRepository.findByFeedPostOrderByCreatedAtAsc(post).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    private GroupFeedPostResponse mapToResponse(GroupFeedPost post) {
        return GroupFeedPostResponse.builder()
                .id(post.getId())
                .groupId(post.getGroup().getId())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getFullName())
                .authorAvatarKey(post.getAuthor().getAvatarKey())
                .content(post.getContent())
                .linkedEntityId(post.getLinkedEntityId())
                .linkedEntityType(post.getLinkedEntityType())
                .pinned(post.isPinned())
                .reactionCount(post.getReactionCount())
                .commentCount(post.getCommentCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private GroupCommentResponse mapToCommentResponse(GroupFeedComment comment) {
        return GroupCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getFeedPost().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFullName())
                .authorAvatarKey(comment.getAuthor().getAvatarKey())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
