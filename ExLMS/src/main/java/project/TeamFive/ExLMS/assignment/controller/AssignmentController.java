package project.TeamFive.ExLMS.assignment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.assignment.dto.request.CreateAssignmentRequest;
import project.TeamFive.ExLMS.assignment.dto.response.AssignmentResponseDTO;
import project.TeamFive.ExLMS.assignment.service.AssignmentService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/groups/{groupId}/assignments")
    public ResponseEntity<AssignmentResponseDTO> createAssignment(
            @PathVariable UUID groupId,
            @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal User creator) {
        return ResponseEntity.ok(assignmentService.createAssignment(groupId, request, creator));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponseDTO> getAssignmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }
}
