package project.TeamFive.ExLMS.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.forum.dto.request.CreatePostRequest;
import project.TeamFive.ExLMS.forum.dto.response.ForumPostResponse;
import project.TeamFive.ExLMS.forum.dto.request.VoteRequest;
import project.TeamFive.ExLMS.forum.entity.ForumVote;
import project.TeamFive.ExLMS.forum.service.ForumService;
import project.TeamFive.ExLMS.forum.service.ForumVoteService;
import project.TeamFive.ExLMS.forum.service.ForumCommentService;
import project.TeamFive.ExLMS.forum.dto.request.CommentRequest;
import project.TeamFive.ExLMS.forum.dto.response.ForumCommentResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private final ForumVoteService voteService;
    private final ForumCommentService commentService;

    @PostMapping("/posts")
    public ResponseEntity<ForumPostResponse> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(forumService.createPost(request, author));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<ForumPostResponse>> getAllPosts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(forumService.searchPosts(search, tag, status));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> getPostById(@PathVariable UUID id) {
        return ResponseEntity.ok(forumService.getPostById(id));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> updatePost(
            @PathVariable UUID id,
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(forumService.updatePost(id, request, author));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(forumService.deletePost(id, author));
    }

    @PostMapping("/posts/{id}/vote")
    public ResponseEntity<Void> votePost(
            @PathVariable UUID id,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal User user) {
        voteService.vote(id, ForumVote.TargetType.FORUM_POST, request, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{id}/pin")
    public ResponseEntity<Void> pinPost(
            @PathVariable UUID id,
            @RequestParam boolean pin) {
        forumService.togglePin(id, pin);
        return ResponseEntity.ok().build();
    }

    // Comment Methods (Consolidated from ForumCommentController)
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ForumCommentResponse> addComment(
            @PathVariable UUID postId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(commentService.addComment(postId, request, author));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<ForumCommentResponse>> getComments(@PathVariable UUID postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @PostMapping("/comments/{id}/vote")
    public ResponseEntity<Void> voteComment(
            @PathVariable UUID id,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal User user) {
        voteService.vote(id, ForumVote.TargetType.FORUM_COMMENT, request, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/{id}/accept")
    public ResponseEntity<Void> acceptComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        commentService.markAsAccepted(id, user);
        return ResponseEntity.ok().build();
    }
}
