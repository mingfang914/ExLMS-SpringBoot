package project.TeamFive.ExLMS.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.request.CourseRequest;
import project.TeamFive.ExLMS.course.dto.response.CourseResponse;
import project.TeamFive.ExLMS.course.service.CourseService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // [CREATE] Tạo khóa học mới trong nhóm
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @PathVariable UUID groupId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(groupId, request));
    }

    // [READ] Lấy danh sách khóa học của nhóm
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @PathVariable UUID groupId) {
        return ResponseEntity.ok(courseService.getCoursesByGroupId(groupId));
    }
}
