package project.TeamFive.ExLMS.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.request.QuizAttemptRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.dto.response.QuizAttemptResponse;
import project.TeamFive.ExLMS.quiz.dto.response.QuizStatsResponse;
import project.TeamFive.ExLMS.quiz.service.QuizService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<QuizResponseDTO> createQuiz(
            @PathVariable UUID courseId,
            @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal User creator) {
        return ResponseEntity.ok(quizService.createQuiz(courseId, request, creator));
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<List<QuizResponseDTO>> getQuizzesByCourseId(@PathVariable UUID courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourseId(courseId));
    }

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponseDTO> updateQuiz(
            @PathVariable UUID id,
            @RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @PostMapping("/quizzes/{id}/attempts")
    public ResponseEntity<QuizAttemptResponse> startAttempt(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.startAttempt(id, user));
    }

    @PostMapping("/quizzes/attempts/{attemptId}/submit")
    public ResponseEntity<QuizAttemptResponse> submitAttempt(
            @PathVariable UUID attemptId,
            @RequestBody QuizAttemptRequest request) {
        return ResponseEntity.ok(quizService.submitAttempt(attemptId, request));
    }

    @GetMapping("/quizzes/attempts/{attemptId}/result")
    public ResponseEntity<QuizAttemptResponse> getAttemptResult(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(quizService.getAttemptResult(attemptId));
    }

    /** Lấy danh sách lần làm bài của tôi cho quiz này */
    @GetMapping("/quizzes/{id}/my-attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getMyAttempts(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.getMyAttempts(id, user));
    }

    @GetMapping("/quizzes/{id}/stats")
    public ResponseEntity<QuizStatsResponse> getQuizStats(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizStats(id));
    }
}
