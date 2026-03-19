package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.quiz.entity.QuizAnswer;

import java.util.List;
import java.util.UUID;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {
    List<QuizAnswer> findByQuestionIdOrderByOrderIndexAsc(UUID questionId);
}
