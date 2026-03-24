package project.TeamFive.ExLMS.course.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.request.LessonRequest;
import project.TeamFive.ExLMS.course.dto.response.LessonResponse;
import project.TeamFive.ExLMS.course.service.LessonService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chapters/{chapterId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(@PathVariable UUID chapterId) {
        return ResponseEntity.ok(lessonService.getLessonsByChapter(chapterId));
    }

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable UUID chapterId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.createLesson(
                chapterId,
                request.getTitle(),
                request.getContentType(),
                request.getContent(),
                request.getResourceKey(),
                request.getDurationSeconds()));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable UUID chapterId,
            @PathVariable UUID lessonId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(
                lessonId, request.getTitle(), request.getContent(),
                request.getResourceKey(), request.getDurationSeconds()));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<String> deleteLesson(
            @PathVariable UUID chapterId,
            @PathVariable UUID lessonId) {
        return ResponseEntity.ok(lessonService.deleteLesson(lessonId));
    }

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<String> markComplete(
            @PathVariable UUID chapterId,
            @PathVariable UUID lessonId) {
        return ResponseEntity.ok(lessonService.markLessonComplete(lessonId));
    }


}
