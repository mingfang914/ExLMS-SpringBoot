package project.TeamFive.ExLMS.quiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizStatsResponse {
    private UUID quizId;
    private double averageScore;
    private long totalAttempts;
    private double passRate;
    private Map<String, Long> scoreDistribution; // e.g. "0-20": 5, "21-40": 10...
    private List<QuestionStats> mostWrongQuestions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionStats {
        private UUID questionId;
        private String content;
        private long wrongCount;
        private double wrongPercentage;
    }
}
