package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.QuizResponse;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizResponseRepository extends JpaRepository<QuizResponse, UUID> {
    List<QuizResponse> findByAttempt_Id(UUID attemptId);
    List<QuizResponse> findByAttempt_Quiz_Id(UUID quizId);
}
