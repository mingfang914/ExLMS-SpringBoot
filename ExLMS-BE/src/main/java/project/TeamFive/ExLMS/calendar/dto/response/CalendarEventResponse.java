package project.TeamFive.ExLMS.calendar.dto.response;

import lombok.Builder;
import lombok.Data;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent.EventType;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent.SourceEntityType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CalendarEventResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private EventType eventType;
    private String color;
    private UUID sourceEntityId;
    private SourceEntityType sourceEntityType;
    private boolean personal;
    private LocalDateTime reminderAt;
    private LocalDateTime createdAt;
}
