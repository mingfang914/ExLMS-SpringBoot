package project.TeamFive.ExLMS.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.forum.dto.request.TagRequest;
import project.TeamFive.ExLMS.forum.dto.response.TagResponse;
import project.TeamFive.ExLMS.forum.service.ForumTagService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum/tags")
@RequiredArgsConstructor
public class ForumTagController {

    private final ForumTagService tagService;

    @PostMapping
    public ResponseEntity<TagResponse> createTag(
            @RequestBody TagRequest request,
            @AuthenticationPrincipal User creator) {
        return ResponseEntity.ok(tagService.createTag(request, creator));
    }

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Void> followTag(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        tagService.followTag(id, user);
        return ResponseEntity.ok().build();
    }
}
