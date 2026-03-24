package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.assignment.entity.AssignmentSubmission;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {
    List<AssignmentSubmission> findByAssignment_Id(UUID assignmentId);
    List<AssignmentSubmission> findByAssignment_IdAndStudent_Id(UUID assignmentId, UUID studentId);
    Optional<AssignmentSubmission> findTopByAssignment_IdAndStudent_IdOrderByAttemptNumberDesc(UUID assignmentId, UUID studentId);
    long countByAssignment_IdAndStudent_Id(UUID assignmentId, UUID studentId);
}
