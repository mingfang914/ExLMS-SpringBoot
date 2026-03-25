package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.response.LessonResponse;
import project.TeamFive.ExLMS.course.entity.*;
import project.TeamFive.ExLMS.course.repository.*;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final CourseLessonRepository lessonRepository;
    private final CourseChapterRepository chapterRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository progressRepository;
    private final GroupMemberRepository groupMemberRepository;

    private void requireInstructorRole(CourseChapter chapter, User user) {
        var member = groupMemberRepository.findByGroup_IdAndUser_Id(
                chapter.getCourse().getGroup().getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException("Chỉ OWNER/EDITOR mới được quản lý bài học!");
        }
    }

    @Transactional
    public LessonResponse createLesson(UUID chapterId, String title,
            String contentType, String content, String resourceKey, Integer durationSeconds) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương học!"));
        requireInstructorRole(chapter, currentUser);

        int nextOrder = lessonRepository.findByChapter_IdOrderByOrderIndexAsc(chapterId).size();

        CourseLesson lesson = CourseLesson.builder()
                .chapter(chapter)
                .title(title)
                .contentType(CourseLesson.ContentType.DOCUMENT)
                .content(content)
                .resourceKey(resourceKey)
                .durationSeconds(durationSeconds)
                .orderIndex(nextOrder)
                .build();
        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByChapter(UUID chapterId) {
        return lessonRepository.findByChapter_IdOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonResponse updateLesson(UUID lessonId, String title, String content,
            String resourceKey, Integer durationSeconds) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));
        requireInstructorRole(lesson.getChapter(), currentUser);

        if (title != null) lesson.setTitle(title);
        if (content != null) lesson.setContent(content);
        if (resourceKey != null) lesson.setResourceKey(resourceKey);
        if (durationSeconds != null) lesson.setDurationSeconds(durationSeconds);
        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public String deleteLesson(UUID lessonId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));
        requireInstructorRole(lesson.getChapter(), currentUser);
        lessonRepository.delete(lesson);
        return "Đã xóa bài học!";
    }

    /**
     * Đánh dấu bài học hoàn thành + tính lại progress_percent của enrollment
     */
    @Transactional
    public String markLessonComplete(UUID lessonId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));

        UUID courseId = lesson.getChapter().getCourse().getId();
        CourseEnrollment enrollment = enrollmentRepository
                .findByCourse_IdAndUser_Id(courseId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

        // Tạo hoặc cập nhật LessonProgress
        LessonProgress progress = progressRepository
                .findByEnrollment_IdAndLesson_Id(enrollment.getId(), lessonId)
                .orElse(LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .build());

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);

            // Tính lại progress_percent
            long completedCount = progressRepository.countByEnrollment_IdAndCompletedTrue(enrollment.getId());

            // Lấy tổng tất cả lessons trong course
            var allChapters = chapterRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
            long totalCourseLessons = allChapters.stream()
                    .mapToLong(c -> lessonRepository.findByChapter_IdOrderByOrderIndexAsc(c.getId()).size())
                    .sum();

            int percent = totalCourseLessons > 0
                    ? (int) (completedCount * 100 / totalCourseLessons) : 0;
            enrollment.setProgressPercent(Math.min(percent, 100));

            if (enrollment.getProgressPercent() >= 80 && !enrollment.isCompleted()) {
                enrollment.setCompleted(true);
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            enrollmentRepository.save(enrollment);
        }
        return "Đã đánh dấu hoàn thành bài học!";
    }

    private LessonResponse mapToResponse(CourseLesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .title(lesson.getTitle())
                .contentType(lesson.getContentType().name())
                .content(lesson.getContent())
                .resourceKey(lesson.getResourceKey())
                .durationSeconds(lesson.getDurationSeconds())
                .orderIndex(lesson.getOrderIndex())
                .build();
    }
}
