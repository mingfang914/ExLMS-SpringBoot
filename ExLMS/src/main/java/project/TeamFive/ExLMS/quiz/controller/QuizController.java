package project.TeamFive.ExLMS.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.service.QuizService;

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

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }
}
