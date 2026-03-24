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

import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberRepository groupMemberRepository;

    private void requireInstructorRole(StudyGroup group, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException(
                    "Truy cập bị từ chối: Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền quản lý Bài tập!");
        }
    }

    @Transactional
    public AssignmentResponseDTO createAssignment(UUID groupId, CreateAssignmentRequest request, User creator) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Study Group not found"));

        requireInstructorRole(group, creator);

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

    @Transactional(readOnly = true)
    public AssignmentResponseDTO getAssignmentById(UUID id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return AssignmentResponseDTO.fromEntity(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponseDTO> getAssignmentsByGroup(UUID groupId, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Assignment> assignments = assignmentRepository.findByGroup_Id(groupId);
        boolean isInstructor = isInstructor(group, user);

        return filterAssignmentsByVisibility(assignments, isInstructor);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponseDTO> getAssignmentsByCourse(UUID courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Assignment> assignments = assignmentRepository.findByCourse_Id(courseId);
        boolean isInstructor = isInstructor(course.getGroup(), user);

        return filterAssignmentsByVisibility(assignments, isInstructor);
    }

    @Transactional
    public AssignmentResponseDTO updateAssignment(UUID id, CreateAssignmentRequest request, User user) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        requireInstructorRole(assignment.getGroup(), user);

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setMaxScore(request.getMaxScore());
        assignment.setDueAt(request.getDueAt());
        assignment.setSubmissionType(request.getSubmissionType());
        assignment.setAllowedFileTypes(request.getAllowedFileTypes());
        assignment.setMaxFileSizeMb(request.getMaxFileSizeMb());
        assignment.setAllowLate(request.isAllowLate());
        assignment.setLatePenaltyPercent(request.getLatePenaltyPercent());

        return AssignmentResponseDTO.fromEntity(assignmentRepository.save(assignment));
    }

    @Transactional
    public void deleteAssignment(UUID id, User user) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        requireInstructorRole(assignment.getGroup(), user);

        assignmentRepository.delete(assignment);
    }

    private boolean isInstructor(StudyGroup group, User user) {
        return groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .map(m -> "OWNER".equals(m.getRole()) || "EDITOR".equals(m.getRole()))
                .orElse(false);
    }

    private List<AssignmentResponseDTO> filterAssignmentsByVisibility(List<Assignment> assignments, boolean isInstructor) {
        LocalDateTime now = LocalDateTime.now();
        return assignments.stream()
                .filter(a -> isInstructor || 
                             (a.getStatus() == Assignment.AssignmentStatus.PUBLISHED && 
                              a.getAssignedAt() != null && a.getAssignedAt().isBefore(now)))
                .map(AssignmentResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
