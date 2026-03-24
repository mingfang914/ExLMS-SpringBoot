package project.TeamFive.ExLMS.quiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {
    private UUID id;
    private UUID quizId;
    private UUID userId;
    private Integer score;
    private int attemptNumber;
    private Boolean passed;
    private Integer passingScore; // Thêm trường này
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private List<QuestionResultResponse> responses; // Đổi tên từ results -> responses

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResultResponse {
        private UUID questionId;
        private String questionContent;
        private String content; // Đổi tên từ userAnswer -> content để match frontend
        private boolean correct;
        private int points;
        private int totalPoints;
        private String explanation;
        private String feedback;
    }
}
