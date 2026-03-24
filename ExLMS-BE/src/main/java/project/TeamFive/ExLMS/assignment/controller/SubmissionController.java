package project.TeamFive.ExLMS.assignment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.TeamFive.ExLMS.assignment.dto.request.SubmissionRequest;
import project.TeamFive.ExLMS.assignment.dto.response.SubmissionResponseDTO;
import project.TeamFive.ExLMS.assignment.service.SubmissionService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<SubmissionResponseDTO> submitAssignment(
            @PathVariable UUID assignmentId,
            @RequestPart("request") SubmissionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.submitAssignment(assignmentId, request, file, student));
    }

    @GetMapping("/assignments/{assignmentId}/my-submissions")
    public ResponseEntity<List<SubmissionResponseDTO>> getMySubmissions(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.getMySubmissions(assignmentId, student));
    }

    @PutMapping("/submissions/{id}")
    public ResponseEntity<SubmissionResponseDTO> updateSubmission(
            @PathVariable UUID id,
            @RequestPart("request") SubmissionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.updateSubmission(id, request, file, student));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable UUID id,
            @AuthenticationPrincipal User student) {
        submissionService.deleteSubmission(id, student);
        return ResponseEntity.noContent().build();
    }
}
