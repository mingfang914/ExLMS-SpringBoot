package project.TeamFive.ExLMS.meeting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.meeting.dto.request.CreateMeetingRequest;
import project.TeamFive.ExLMS.meeting.dto.response.MeetingResponseDTO;
import project.TeamFive.ExLMS.meeting.service.MeetingService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping("/groups/{groupId}/meetings")
    public ResponseEntity<MeetingResponseDTO> scheduleMeeting(
            @PathVariable UUID groupId,
            @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal User creator) {
        return ResponseEntity.ok(meetingService.scheduleMeeting(groupId, request, creator));
    }

    @GetMapping("/meetings/{id}")
    public ResponseEntity<MeetingResponseDTO> getMeetingById(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.getMeetingById(id));
    }
}
