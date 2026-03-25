package project.TeamFive.ExLMS.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "new_assignment", nullable = false)
    @Builder.Default
    private boolean newAssignment = true;

    @Column(name = "assignment_graded", nullable = false)
    @Builder.Default
    private boolean assignmentGraded = true;

    @Column(name = "assignment_due_soon", nullable = false)
    @Builder.Default
    private boolean assignmentDueSoon = true;

    @Column(name = "new_meeting", nullable = false)
    @Builder.Default
    private boolean newMeeting = true;

    @Column(name = "meeting_starting_soon", nullable = false)
    @Builder.Default
    private boolean meetingStartingSoon = true;

    @Column(name = "new_course", nullable = false)
    @Builder.Default
    private boolean newCourse = true;

    @Column(name = "forum_reply", nullable = false)
    @Builder.Default
    private boolean forumReply = true;

    @Column(name = "mention", nullable = false)
    @Builder.Default
    private boolean mention = true;

    @Column(name = "group_join_request", nullable = false)
    @Builder.Default
    private boolean groupJoinRequest = true;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;
}
