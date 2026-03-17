package project.TeamFive.ExLMS.assignment.dto.response;

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
public class AssignmentResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID groupId;
    private UUID courseId;
    private int maxScore;
    private LocalDateTime assignedAt;
    private LocalDateTime dueAt;
    private Assignment.SubmissionType submissionType;
    private String allowedFileTypes;
    private int maxFileSizeMb;
    private boolean allowLate;
    private int latePenaltyPercent;
    private Assignment.AssignmentStatus status;

    public static AssignmentResponseDTO fromEntity(Assignment assignment) {
        return AssignmentResponseDTO.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .groupId(assignment.getGroup().getId())
                .courseId(assignment.getCourse() != null ? assignment.getCourse().getId() : null)
                .maxScore(assignment.getMaxScore())
                .assignedAt(assignment.getAssignedAt())
                .dueAt(assignment.getDueAt())
                .submissionType(assignment.getSubmissionType())
                .allowedFileTypes(assignment.getAllowedFileTypes())
                .maxFileSizeMb(assignment.getMaxFileSizeMb())
                .allowLate(assignment.isAllowLate())
                .latePenaltyPercent(assignment.getLatePenaltyPercent())
                .status(assignment.getStatus())
                .build();
    }
}
