package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.request.CourseRequest;
import project.TeamFive.ExLMS.course.dto.response.CourseResponse;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.service.FileService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FileService fileService;

    // --- HÀM DÙNG CHUNG: Kiểm tra quyền Giảng viên (Owner/Editor) ---
    private void requireInstructorRole(StudyGroup group, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException(
                    "Truy cập bị từ chối: Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền quản lý khóa học!");
        }
    }

    // ==================== CREATE ====================
    @Transactional
    public CourseResponse createCourse(UUID groupId, CourseRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        // 1. Kiểm tra quyền (Chốt chặn bảo mật)
        requireInstructorRole(group, currentUser);

        // 2. Tạo khóa học
        String thumbnailKey = request.getThumbnailKey();
        if (thumbnailKey == null || thumbnailKey.trim().isEmpty()) {
            thumbnailKey = "DefaultCourseImg.png";
        }

        Course newCourse = Course.builder()
                .group(group)
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailKey(thumbnailKey)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .createdBy(currentUser)
                .build();

        courseRepository.save(newCourse);
        return mapToResponse(newCourse);
    }

    // ==================== READ (Tối ưu với readOnly = true) ====================
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByGroupId(UUID groupId) {
        // Sinh viên trong nhóm cũng có thể xem danh sách khóa học, nên ở đây ta chỉ cần
        // check có phải thành viên không
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        if (!groupMemberRepository.existsByGroupAndUser(group, currentUser)) {
            throw new RuntimeException("Bạn phải tham gia nhóm mới xem được khóa học!");
        }

        return courseRepository.findByGroup_Id(groupId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==================== READ 1 COURSE ====================
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        return mapToResponse(course);
    }

    // ==================== UPDATE ====================
    @Transactional
    public CourseResponse updateCourse(UUID courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        requireInstructorRole(course.getGroup(), currentUser);

        if (request.getTitle() != null)
            course.setTitle(request.getTitle());
        if (request.getDescription() != null)
            course.setDescription(request.getDescription());
        if (request.getThumbnailKey() != null)
            course.setThumbnailKey(request.getThumbnailKey());
        if (request.getStatus() != null)
            course.setStatus(request.getStatus());
        if (request.getStartDate() != null)
            course.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            course.setEndDate(request.getEndDate());

        return mapToResponse(courseRepository.save(course));
    }

    // ==================== DELETE ====================
    @Transactional
    public String deleteCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        requireInstructorRole(course.getGroup(), currentUser);

        course.setStatus("DELETED"); // Soft delete
        courseRepository.save(course);
        return "Đã xóa khóa học thành công!";
    }

    // --- Hàm phụ trợ map sang DTO ---
    private CourseResponse mapToResponse(Course course) {
        String thumbUrl = null;
        if (course.getThumbnailKey() != null && !course.getThumbnailKey().trim().isEmpty()) {
            try {
                thumbUrl = fileService.getPresignedUrl(course.getThumbnailKey());
            } catch (Exception e) {
            }
        }

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .status(course.getStatus())
                .groupId(course.getGroup().getId())
                .thumbnailUrl(thumbUrl)
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .build();
    }
}
