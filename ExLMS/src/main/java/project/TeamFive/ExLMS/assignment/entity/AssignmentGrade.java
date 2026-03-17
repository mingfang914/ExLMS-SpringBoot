package project.TeamFive.ExLMS.assignment.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentGrade extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private AssignmentSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grader_id", nullable = false)
    private User grader;

    @Column(nullable = false)
    private int score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "feedback_key", length = 36)
    private String feedbackKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradeStatus status = GradeStatus.GRADED;

    @Column(name = "graded_at", nullable = false)
    private LocalDateTime gradedAt = LocalDateTime.now();

    public enum GradeStatus {
        PENDING, GRADED, RETURNED
    }
}
