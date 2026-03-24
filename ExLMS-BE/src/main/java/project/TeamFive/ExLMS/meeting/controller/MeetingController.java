package project.TeamFive.ExLMS.meeting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.meeting.dto.request.CreateMeetingRequest;
import project.TeamFive.ExLMS.meeting.dto.request.CreatePollRequest;
import project.TeamFive.ExLMS.meeting.dto.request.QuestionRequest;
import project.TeamFive.ExLMS.meeting.dto.response.MeetingAttendanceResponseDTO;
import project.TeamFive.ExLMS.meeting.dto.response.MeetingResponseDTO;
import project.TeamFive.ExLMS.meeting.dto.response.PollResponseDTO;
import project.TeamFive.ExLMS.meeting.dto.response.QuestionResponseDTO;
import project.TeamFive.ExLMS.meeting.service.MeetingService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping("/group/{groupId}")
    public ResponseEntity<MeetingResponseDTO> scheduleMeeting(
            @PathVariable UUID groupId,
            @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.scheduleMeeting(groupId, request, user));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<MeetingResponseDTO>> getMeetingsByGroup(@PathVariable UUID groupId) {
        return ResponseEntity.ok(meetingService.getMeetingsByGroup(groupId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponseDTO> getMeetingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.getMeetingById(id, user));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startMeeting(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        meetingService.startMeeting(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Void> endMeeting(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        meetingService.endMeeting(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponseDTO> updateMeeting(
            @PathVariable UUID id,
            @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.updateMeeting(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        meetingService.deleteMeeting(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/attend")
    public ResponseEntity<Void> recordAttendance(
            @PathVariable UUID id,
            @RequestParam boolean joining,
            @AuthenticationPrincipal User user) {
        meetingService.recordAttendance(id, user, joining);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<List<MeetingAttendanceResponseDTO>> getAttendanceReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.getAttendanceReport(id, user));
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuestionResponseDTO> addQuestion(
            @PathVariable UUID id,
            @RequestBody QuestionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.addQuestion(id, request, user));
    }

    @PostMapping("/questions/{questionId}/answer")
    public ResponseEntity<Void> answerQuestion(
            @PathVariable UUID questionId,
            @RequestParam String answer,
            @AuthenticationPrincipal User user) {
        meetingService.answerQuestion(questionId, answer, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getQuestions(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.getQuestions(id));
    }

    @PostMapping("/{id}/polls")
    public ResponseEntity<PollResponseDTO> createPoll(
            @PathVariable UUID id,
            @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.createPoll(id, request, user));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<Void> voteInPoll(
            @PathVariable UUID pollId,
            @RequestParam UUID optionId,
            @AuthenticationPrincipal User user) {
        meetingService.voteInPoll(pollId, optionId, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/polls")
    public ResponseEntity<List<PollResponseDTO>> getPolls(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.getPolls(id, user));
    }
}
