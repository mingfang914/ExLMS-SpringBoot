package project.TeamFive.ExLMS.meeting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID groupId;
    private Meeting.MeetingType meetingType;
    private String platform;
    private String joinUrl;
    private LocalDateTime startAt;
    private int durationMinutes;
    private Meeting.MeetingStatus status;
    private String currentUserRole;

    public static MeetingResponseDTO fromEntity(Meeting meeting) {
        return MeetingResponseDTO.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .groupId(meeting.getGroup().getId())
                .meetingType(meeting.getMeetingType())
                .platform(meeting.getPlatform())
                .joinUrl(meeting.getJoinUrl())
                .startAt(meeting.getStartAt())
                .durationMinutes(meeting.getDurationMinutes())
                .status(meeting.getStatus())
                .build();
    }
}
