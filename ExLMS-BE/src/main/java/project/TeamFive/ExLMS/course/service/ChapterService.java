package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.entity.CourseChapter;
import project.TeamFive.ExLMS.course.repository.CourseChapterRepository;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.course.dto.response.ChapterResponse;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ChapterService {

    private final CourseChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberRepository groupMemberRepository;

    private void requireInstructorRole(Course course, User user) {
        var member = groupMemberRepository.findByGroup_IdAndUser_Id(course.getGroup().getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException("Chỉ OWNER/EDITOR mới được quản lý chương học!");
        }
    }

    @Transactional
    public ChapterResponse createChapter(UUID courseId, String title, String description) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        requireInstructorRole(course, currentUser);

        int nextOrder = chapterRepository.findByCourse_IdOrderByOrderIndexAsc(courseId).size();

        CourseChapter chapter = CourseChapter.builder()
                .course(course)
                .title(title)
                .description(description)
                .orderIndex(nextOrder)
                .build();
        return mapToResponse(chapterRepository.save(chapter));
    }

    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersByCourse(UUID courseId) {
        return chapterRepository.findByCourse_IdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChapterResponse updateChapter(UUID chapterId, String title, String description, Boolean locked) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương học!"));
        requireInstructorRole(chapter.getCourse(), currentUser);

        if (title != null) chapter.setTitle(title);
        if (description != null) chapter.setDescription(description);
        if (locked != null) chapter.setLocked(locked);
        return mapToResponse(chapterRepository.save(chapter));
    }

    @Transactional
    public String deleteChapter(UUID chapterId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương học!"));
        requireInstructorRole(chapter.getCourse(), currentUser);
        chapterRepository.delete(chapter);
        return "Đã xóa chương học!";
    }

    @Transactional
    public String reorderChapters(UUID courseId, List<UUID> orderedIds) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        requireInstructorRole(course, currentUser);

        for (int i = 0; i < orderedIds.size(); i++) {
            final int idx = i;
            chapterRepository.findById(orderedIds.get(i)).ifPresent(c -> {
                c.setOrderIndex(idx);
                chapterRepository.save(c);
            });
        }
        return "Đã cập nhật thứ tự chương!";
    }

    private ChapterResponse mapToResponse(CourseChapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .locked(chapter.isLocked())
                .build();
    }
}
