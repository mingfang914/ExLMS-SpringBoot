package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.response.EnrollmentResponse;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.entity.CourseEnrollment;
import project.TeamFive.ExLMS.course.repository.CourseEnrollmentRepository;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * Đăng ký học một khóa học (user phải là thành viên nhóm trước)
     * Returns EnrollmentResponse DTO mapped within transaction to avoid lazy load issues.
     */
    @Transactional
    public EnrollmentResponse enrollCourse(UUID courseId, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        groupMemberRepository
                .findByGroup_IdAndUser_Id(course.getGroup().getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa tham gia nhóm học tập này!"));

        if (enrollmentRepository.existsByCourse_IdAndUser_Id(courseId, currentUser.getId())) {
            throw new RuntimeException("Bạn đã đăng ký khóa học này rồi!");
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .course(course)
                .user(currentUser)
                .progressPercent(0)
                .completed(false)
                .enrolledAt(LocalDateTime.now())
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);

        // Map to DTO within transaction (while session is open)
        return EnrollmentResponse.from(saved);
    }

    /**
     * Lấy tiến độ học của user hiện tại trong 1 khóa học.
     * Returns Optional DTO, no exception thrown when not enrolled.
     */
    @Transactional(readOnly = true)
    public Optional<EnrollmentResponse> findMyEnrollment(UUID courseId, User currentUser) {
        return enrollmentRepository.findByCourse_IdAndUser_Id(courseId, currentUser.getId())
                .map(EnrollmentResponse::from);
    }
}
