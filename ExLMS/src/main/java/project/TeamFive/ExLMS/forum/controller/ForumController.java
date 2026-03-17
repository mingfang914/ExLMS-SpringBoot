package project.TeamFive.ExLMS.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.forum.dto.request.CreatePostRequest;
import project.TeamFive.ExLMS.forum.dto.response.ForumPostResponse;
import project.TeamFive.ExLMS.forum.service.ForumService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @PostMapping("/posts")
    public ResponseEntity<ForumPostResponse> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(forumService.createPost(request, author));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<ForumPostResponse>> getAllPosts() {
        return ResponseEntity.ok(forumService.getAllPosts());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> getPostById(@PathVariable UUID id) {
        return ResponseEntity.ok(forumService.getPostById(id));
    }
}
