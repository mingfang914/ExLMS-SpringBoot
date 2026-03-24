package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.QuizAttempt;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByQuiz_IdAndUser_Id(UUID quizId, UUID userId);
    /** Count ALL attempts (for reference) */
    long countByQuiz_IdAndUser_Id(UUID quizId, UUID userId);
    /** Count only SUBMITTED attempts — used for max-attempts check */
    long countByQuiz_IdAndUser_IdAndSubmittedAtIsNotNull(UUID quizId, UUID userId);
    Optional<QuizAttempt> findTopByQuiz_IdAndUser_IdOrderByAttemptNumberDesc(UUID quizId, UUID userId);
    List<QuizAttempt> findByQuizId(UUID quizId);
}
