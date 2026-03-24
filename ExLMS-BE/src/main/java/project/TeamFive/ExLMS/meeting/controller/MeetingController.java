package project.TeamFive.ExLMS.meeting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
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
            @PathVariable("groupId") String groupId,
            @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal User user) {
        try {
            UUID gId = UUID.fromString(groupId.trim());
            return ResponseEntity.ok(meetingService.scheduleMeeting(gId, request, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Group ID format: " + groupId);
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<MeetingResponseDTO>> getMeetingsByGroup(@PathVariable("groupId") String groupId) {
        try {
            UUID gId = UUID.fromString(groupId.trim());
            return ResponseEntity.ok(meetingService.getMeetingsByGroup(gId));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Group ID format: " + groupId);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponseDTO> getMeetingById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User user) {
        try {
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.getMeetingById(meetingId, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startMeeting(@PathVariable("id") String id, @AuthenticationPrincipal User user) {
        try {
            UUID meetingId = UUID.fromString(id.trim());
            meetingService.startMeeting(meetingId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Void> endMeeting(@PathVariable("id") String id, @AuthenticationPrincipal User user) {
        try {
            UUID meetingId = UUID.fromString(id.trim());
            meetingService.endMeeting(meetingId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponseDTO> updateMeeting(
            @PathVariable("id") String id,
            @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal User user) {
        try {
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.updateMeeting(meetingId, request, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable("id") String id, @AuthenticationPrincipal User user) {
        try {
            UUID meetingId = UUID.fromString(id.trim());
            meetingService.deleteMeeting(meetingId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/{id}/attend")
    public ResponseEntity<Void> recordAttendance(
            @PathVariable("id") String id,
            @RequestParam("joining") boolean joining,
            @AuthenticationPrincipal User user) {
        try {
            System.out.println("DEBUG: recordAttendance raw id: '" + id + "'");
            UUID meetingId = UUID.fromString(id.trim());
            meetingService.recordAttendance(meetingId, user, joining);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<List<MeetingAttendanceResponseDTO>> getAttendanceReport(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User user) {
        try {
            System.out.println("DEBUG: getAttendanceReport raw id: '" + id + "'");
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.getAttendanceReport(meetingId, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuestionResponseDTO> addQuestion(
            @PathVariable("id") String id,
            @RequestBody QuestionRequest request,
            @AuthenticationPrincipal User user) {
        try {
            System.out.println("DEBUG: addQuestion raw id: '" + id + "'");
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.addQuestion(meetingId, request, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/questions/{questionId}/answer")
    public ResponseEntity<Void> answerQuestion(
            @PathVariable("questionId") String questionId,
            @RequestParam("answer") String answer,
            @AuthenticationPrincipal User user) {
        try {
            System.out.println("DEBUG: answerQuestion raw id: '" + questionId + "'");
            UUID qId = UUID.fromString(questionId.trim());
            meetingService.answerQuestion(qId, answer, user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + questionId);
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getQuestions(@PathVariable("id") String id) {
        try {
            System.out.println("DEBUG: getQuestions raw id: '" + id + "'");
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.getQuestions(meetingId));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }

    @PostMapping("/{id}/polls")
    public ResponseEntity<PollResponseDTO> createPoll(
            @PathVariable("id") String id,
            @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal User user) {
        UUID meetingId = UUID.fromString(id.trim());
        return ResponseEntity.ok(meetingService.createPoll(meetingId, request, user));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<Void> voteInPoll(
            @PathVariable("pollId") String pollId,
            @RequestParam("optionId") String optionId,
            @AuthenticationPrincipal User user) {
        try {
            UUID pId = UUID.fromString(pollId.trim());
            UUID oId = UUID.fromString(optionId.trim());
            meetingService.voteInPoll(pId, oId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format");
        }
    }

    @GetMapping("/{id}/polls")
    public ResponseEntity<List<PollResponseDTO>> getPolls(@PathVariable("id") String id, @AuthenticationPrincipal User user) {
        try {
            System.out.println("DEBUG: getPolls raw id: '" + id + "'");
            UUID meetingId = UUID.fromString(id.trim());
            return ResponseEntity.ok(meetingService.getPolls(meetingId, user));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format: " + id);
        }
    }
}
