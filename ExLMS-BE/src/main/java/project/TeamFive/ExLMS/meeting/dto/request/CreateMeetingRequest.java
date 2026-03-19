package project.TeamFive.ExLMS.meeting.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMeetingRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private Meeting.MeetingType meetingType = Meeting.MeetingType.VIDEO_CONFERENCE;
    private LocalDateTime startAt;
    private int durationMinutes = 60;
}
