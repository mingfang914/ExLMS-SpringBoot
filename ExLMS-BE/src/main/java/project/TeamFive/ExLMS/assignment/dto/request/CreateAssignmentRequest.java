package project.TeamFive.ExLMS.assignment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private UUID courseId;
    @Builder.Default
    private int maxScore = 100;
    private LocalDateTime dueAt;
    @Builder.Default
    private Assignment.SubmissionType submissionType = Assignment.SubmissionType.FILE;
    private String allowedFileTypes;
    @Builder.Default
    private int maxFileSizeMb = 50;
    @Builder.Default
    private boolean allowLate = false;
    @Builder.Default
    private int latePenaltyPercent = 0;
}
