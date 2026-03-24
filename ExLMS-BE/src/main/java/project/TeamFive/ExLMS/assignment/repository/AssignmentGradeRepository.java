package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.assignment.entity.AssignmentGrade;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentGradeRepository extends JpaRepository<AssignmentGrade, UUID> {
    Optional<AssignmentGrade> findBySubmission_Id(UUID submissionId);
}
