package project.TeamFive.ExLMS.course.dto.response;

import lombok.Builder;
import lombok.Data;
import project.TeamFive.ExLMS.course.entity.CourseEnrollment;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EnrollmentResponse {
    private UUID id;
    private UUID courseId;
    private UUID userId;
    private int progressPercent;
    private boolean completed;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public static EnrollmentResponse from(CourseEnrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .courseId(e.getCourse().getId())
                .userId(e.getUser().getId())
                .progressPercent(e.getProgressPercent())
                .completed(e.isCompleted())
                .enrolledAt(e.getEnrolledAt())
                .completedAt(e.getCompletedAt())
                .build();
    }
}
