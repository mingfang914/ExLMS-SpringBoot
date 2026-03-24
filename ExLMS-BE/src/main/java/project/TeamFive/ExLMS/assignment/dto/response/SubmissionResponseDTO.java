package project.TeamFive.ExLMS.assignment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.AssignmentSubmission;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponseDTO {
    private UUID id;
    private UUID assignmentId;
    private UUID studentId;
    private String studentName;
    private Assignment.SubmissionType submissionType;
    private String textContent;
    private String fileKey;
    private String fileName;
    private Integer fileSize;
    private String externalUrl;
    private boolean isLate;
    private int attemptNumber;
    private LocalDateTime submittedAt;
    private String fileUrl; // Presigned URL

    // Grade info
    private Integer score;
    private String feedback;
    private String gradeStatus; // PENDING, GRADED, RETURNED

    public static SubmissionResponseDTO fromEntity(AssignmentSubmission sub) {
        return SubmissionResponseDTO.builder()
                .id(sub.getId())
                .assignmentId(sub.getAssignment().getId())
                .studentId(sub.getStudent().getId())
                .studentName(sub.getStudent().getFullName())
                .submissionType(sub.getSubmissionType())
                .textContent(sub.getTextContent())
                .fileKey(sub.getFileKey())
                .fileName(sub.getFileName())
                .fileSize(sub.getFileSize())
                .externalUrl(sub.getExternalUrl())
                .isLate(sub.isLate())
                .attemptNumber(sub.getAttemptNumber())
                .submittedAt(sub.getSubmittedAt())
                .build();
    }
}
