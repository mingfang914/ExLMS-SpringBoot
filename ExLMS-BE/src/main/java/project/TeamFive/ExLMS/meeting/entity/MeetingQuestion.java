package project.TeamFive.ExLMS.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "meeting_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by")
    private User answeredBy;

    @Builder.Default
    @Column(name = "is_answered", nullable = false)
    private boolean answered = false;

    @Builder.Default
    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;
}
