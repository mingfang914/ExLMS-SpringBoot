package project.TeamFive.ExLMS.calendar.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(nullable = false, length = 7)
    private String color = "#6366F1";

    @Column(name = "source_entity_id")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
    private UUID sourceEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_entity_type")
    private SourceEntityType sourceEntityType;

    @Column(name = "is_personal", nullable = false)
    private boolean personal = false;

    @Column(name = "reminder_at")
    private LocalDateTime reminderAt;

    public enum EventType {
        MEETING, ASSIGNMENT_DUE, QUIZ, COURSE_START, COURSE_END, PERSONAL, SYSTEM
    }

    public enum SourceEntityType {
        MEETING, ASSIGNMENT, QUIZ, COURSE
    }
}
