package project.TeamFive.ExLMS.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false)
    private MeetingType meetingType = MeetingType.VIDEO_CONFERENCE;

    @Column(length = 50)
    private String platform;

    @Column(name = "join_url", columnDefinition = "TEXT")
    private String joinUrl;

    @Column(length = 50)
    private String passcode;

    @Column(name = "recording_key", length = 36)
    private String recordingKey;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Builder.Default
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 60;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    public enum MeetingType {
        VIDEO_CONFERENCE, WEBINAR, RECORDING_ONLY
    }

    public enum MeetingStatus {
        SCHEDULED, LIVE, ENDED, CANCELLED
    }
}
