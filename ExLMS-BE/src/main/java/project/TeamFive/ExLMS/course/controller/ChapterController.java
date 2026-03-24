package project.TeamFive.ExLMS.course.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.request.ChapterRequest;
import project.TeamFive.ExLMS.course.dto.response.ChapterResponse;
import project.TeamFive.ExLMS.course.service.ChapterService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping
    public ResponseEntity<List<ChapterResponse>> getChapters(@PathVariable UUID courseId) {
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId));
    }

    @PostMapping
    public ResponseEntity<ChapterResponse> createChapter(
            @PathVariable UUID courseId,
            @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(
                chapterService.createChapter(courseId, request.getTitle(), request.getDescription()));
    }

    @PutMapping("/{chapterId}")
    public ResponseEntity<ChapterResponse> updateChapter(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId,
            @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(
                chapterService.updateChapter(chapterId, request.getTitle(), request.getDescription(), request.getLocked()));
    }

    @DeleteMapping("/{chapterId}")
    public ResponseEntity<String> deleteChapter(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId) {
        return ResponseEntity.ok(chapterService.deleteChapter(chapterId));
    }

    @PutMapping("/reorder")
    public ResponseEntity<String> reorderChapters(
            @PathVariable UUID courseId,
            @RequestBody List<UUID> orderedIds) {
        return ResponseEntity.ok(chapterService.reorderChapters(courseId, orderedIds));
    }


}
