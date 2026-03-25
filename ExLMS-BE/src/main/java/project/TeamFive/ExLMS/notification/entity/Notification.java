package project.TeamFive.ExLMS.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "action_url", columnDefinition = "TEXT")
    private String actionUrl;

    @Column(name = "source_entity_id")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
    private UUID sourceEntityId;

    @Column(name = "source_entity_type", length = 60)
    private String sourceEntityType;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public enum NotificationType {
        JOIN_REQUEST, JOIN_APPROVED, JOIN_REJECTED,
        NEW_ASSIGNMENT, ASSIGNMENT_DUE_SOON, ASSIGNMENT_GRADED,
        NEW_MEETING, MEETING_STARTING_SOON,
        NEW_COURSE, FORUM_REPLY, MENTION, CONTENT_REPORTED, SYSTEM
    }
}
