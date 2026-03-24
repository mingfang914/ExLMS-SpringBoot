package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.CourseChapter;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseChapterRepository extends JpaRepository<CourseChapter, UUID> {
    List<CourseChapter> findByCourse_IdOrderByOrderIndexAsc(UUID courseId);
}
