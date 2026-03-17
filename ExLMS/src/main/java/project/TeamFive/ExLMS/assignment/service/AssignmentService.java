package project.TeamFive.ExLMS.assignment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.dto.request.CreateAssignmentRequest;
import project.TeamFive.ExLMS.assignment.dto.response.AssignmentResponseDTO;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.repository.AssignmentRepository;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public AssignmentResponseDTO createAssignment(UUID groupId, CreateAssignmentRequest request, User creator) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Study Group not found"));

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        }

        Assignment assignment = Assignment.builder()
                .group(group)
                .course(course)
                .createdBy(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .maxScore(request.getMaxScore())
                .dueAt(request.getDueAt())
                .submissionType(request.getSubmissionType())
                .allowedFileTypes(request.getAllowedFileTypes())
                .maxFileSizeMb(request.getMaxFileSizeMb())
                .allowLate(request.isAllowLate())
                .latePenaltyPercent(request.getLatePenaltyPercent())
                .status(Assignment.AssignmentStatus.PUBLISHED)
                .build();

        return AssignmentResponseDTO.fromEntity(assignmentRepository.save(assignment));
    }

    public AssignmentResponseDTO getAssignmentById(UUID id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return AssignmentResponseDTO.fromEntity(assignment);
    }
}
