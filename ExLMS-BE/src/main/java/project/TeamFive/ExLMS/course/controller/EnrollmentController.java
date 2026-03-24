package project.TeamFive.ExLMS.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.response.EnrollmentResponse;
import project.TeamFive.ExLMS.course.service.EnrollmentService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/enrollment")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    /** Đăng ký khóa học */
    @PostMapping
    public ResponseEntity<?> enroll(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập lại."));
        }
        EnrollmentResponse enrollment = enrollmentService.enrollCourse(courseId, user);
        return ResponseEntity.ok(enrollment);
    }

    /** Lấy trạng thái đăng ký của tôi (204 nếu chưa đăng ký) */
    @GetMapping("/my")
    public ResponseEntity<EnrollmentResponse> getMyEnrollment(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return enrollmentService.findMyEnrollment(courseId, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
