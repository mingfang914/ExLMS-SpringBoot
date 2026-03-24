package project.TeamFive.ExLMS.calendar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.calendar.dto.response.CalendarEventResponse;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getUserEvents(UUID userId, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CalendarEvent> events;
        if (start != null && end != null) {
            events = calendarEventRepository.findByUserAndStartAtBetweenOrderByStartAtAsc(user, start, end);
        } else {
            events = calendarEventRepository.findByUserOrderByStartAtAsc(user);
        }

        return events.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private CalendarEventResponse mapToResponse(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .eventType(event.getEventType())
                .color(event.getColor())
                .sourceEntityId(event.getSourceEntityId())
                .sourceEntityType(event.getSourceEntityType())
                .personal(event.isPersonal())
                .reminderAt(event.getReminderAt())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
