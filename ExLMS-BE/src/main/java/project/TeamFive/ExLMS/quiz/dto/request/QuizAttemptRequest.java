package project.TeamFive.ExLMS.quiz.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptRequest {
    private List<QuestionAnswerRequest> answers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionAnswerRequest {
        private UUID questionId;
        private UUID selectedAnswerId; // For SINGLE_CHOICE, TRUE_FALSE
        private List<UUID> selectedAnswerIds; // For MULTIPLE_CHOICE
        private String textResponse; // For FILL_BLANK, SHORT_ANSWER
    }
}
