package project.TeamFive.ExLMS.assignment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.assignment.dto.request.GradeRequest;
import project.TeamFive.ExLMS.assignment.dto.response.SubmissionResponseDTO;
import project.TeamFive.ExLMS.assignment.service.GradingService;
import project.TeamFive.ExLMS.user.entity.User;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<SubmissionResponseDTO> gradeSubmission(
            @PathVariable UUID submissionId,
            @RequestBody GradeRequest request,
            @AuthenticationPrincipal User grader) {
        return ResponseEntity.ok(gradingService.gradeSubmission(submissionId, request, grader));
    }

    @PostMapping("/assignments/{assignmentId}/bulk-grade")
    public ResponseEntity<Void> bulkGrade(
            @PathVariable UUID assignmentId,
            @RequestBody Map<UUID, Integer> submissionScores,
            @AuthenticationPrincipal User grader) {
        gradingService.bulkGrade(submissionScores, grader);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<SubmissionResponseDTO>> getAllSubmissions(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User instructor) {
        return ResponseEntity.ok(gradingService.getAllSubmissions(assignmentId, instructor));
    }

    @GetMapping("/assignments/{assignmentId}/export-grades")
    public ResponseEntity<byte[]> exportGrades(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User instructor) throws IOException {
        byte[] excelData = gradingService.exportToExcel(assignmentId, instructor);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grades.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }
}
