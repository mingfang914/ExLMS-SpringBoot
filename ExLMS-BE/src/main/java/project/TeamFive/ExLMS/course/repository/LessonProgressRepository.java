package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.LessonProgress;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByEnrollment_IdAndLesson_Id(UUID enrollmentId, UUID lessonId);
    List<LessonProgress> findByEnrollment_Id(UUID enrollmentId);
    long countByEnrollment_IdAndCompletedTrue(UUID enrollmentId);
}
