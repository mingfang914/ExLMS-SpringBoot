package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.CourseLesson;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseLessonRepository extends JpaRepository<CourseLesson, UUID> {
    List<CourseLesson> findByChapter_IdOrderByOrderIndexAsc(UUID chapterId);
}
