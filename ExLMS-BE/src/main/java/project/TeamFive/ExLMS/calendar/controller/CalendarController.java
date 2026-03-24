package project.TeamFive.ExLMS.calendar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.calendar.dto.response.CalendarEventResponse;
import project.TeamFive.ExLMS.calendar.service.CalendarService;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> getMyEvents(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        List<CalendarEventResponse> events = calendarService.getUserEvents(user.getId(), start, end);
        return ResponseEntity.ok(events);
    }
}
