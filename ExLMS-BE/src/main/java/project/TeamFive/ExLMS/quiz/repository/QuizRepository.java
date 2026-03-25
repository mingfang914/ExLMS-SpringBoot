package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.quiz.entity.Quiz;

import java.util.UUID;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCourse_Id(UUID courseId);
}
