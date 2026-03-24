package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByGroup_Id(UUID groupId);
    List<Assignment> findByCourse_Id(UUID courseId);
}
