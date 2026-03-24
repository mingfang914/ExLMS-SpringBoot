package project.TeamFive.ExLMS.group.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.group.dto.request.GroupCommentRequest;
import project.TeamFive.ExLMS.group.dto.request.GroupFeedPostRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupCommentResponse;
import project.TeamFive.ExLMS.group.dto.response.GroupFeedPostResponse;
import project.TeamFive.ExLMS.group.service.GroupFeedService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/feed")
@RequiredArgsConstructor
public class GroupFeedController {

    private final GroupFeedService feedService;

    @GetMapping
    public ResponseEntity<Page<GroupFeedPostResponse>> getGroupFeed(
            @PathVariable UUID groupId,
            @RequestParam(required = false) String type,
            Pageable pageable) {
        return ResponseEntity.ok(feedService.getGroupFeed(groupId, type, pageable));
    }

    @PostMapping
    public ResponseEntity<GroupFeedPostResponse> createPost(
            @PathVariable UUID groupId,
            @RequestBody GroupFeedPostRequest request) {
        return ResponseEntity.ok(feedService.createPost(groupId, request));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<GroupFeedPostResponse> updatePost(
            @PathVariable UUID groupId,
            @PathVariable UUID postId,
            @RequestBody GroupFeedPostRequest request) {
        return ResponseEntity.ok(feedService.updatePost(postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @PathVariable UUID groupId,
            @PathVariable UUID postId) {
        return ResponseEntity.ok(feedService.deletePost(postId));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<GroupCommentResponse>> getPostComments(
            @PathVariable UUID groupId,
            @PathVariable UUID postId) {
        return ResponseEntity.ok(feedService.getPostComments(postId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<GroupCommentResponse> addComment(
            @PathVariable UUID groupId,
            @PathVariable UUID postId,
            @RequestBody GroupCommentRequest request) {
        return ResponseEntity.ok(feedService.addComment(postId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable UUID groupId,
            @PathVariable UUID commentId) {
        return ResponseEntity.ok(feedService.deleteComment(commentId));
    }

    @PostMapping("/{postId}/reactions")
    public ResponseEntity<String> toggleReaction(
            @PathVariable UUID groupId,
            @PathVariable UUID postId) {
        return ResponseEntity.ok(feedService.toggleReaction(postId));
    }

    @PutMapping("/{postId}/pin")
    public ResponseEntity<String> togglePinPost(
            @PathVariable UUID groupId,
            @PathVariable UUID postId) {
        return ResponseEntity.ok(feedService.togglePinPost(postId));
    }
}
