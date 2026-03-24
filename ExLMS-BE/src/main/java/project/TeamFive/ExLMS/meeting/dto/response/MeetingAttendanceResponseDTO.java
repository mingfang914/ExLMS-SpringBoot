package project.TeamFive.ExLMS.meeting.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MeetingAttendanceResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Integer durationSec;
    private boolean isPresent;
}
