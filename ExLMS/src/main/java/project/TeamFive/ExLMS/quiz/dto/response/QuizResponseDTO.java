package project.TeamFive.ExLMS.quiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.quiz.entity.Quiz;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID chapterId;
    private Integer timeLimitSec;
    private int maxAttempts;
    private int passingScore;
    private boolean shuffleQuestions;
    private Quiz.ResultVisibility resultVisibility;
    private List<QuestionResponse> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private UUID id;
        private String content;
        private String questionType;
        private int points;
        private String explanation;
        private List<AnswerResponse> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResponse {
        private UUID id;
        private String content;
        private boolean correct;
    }
}
