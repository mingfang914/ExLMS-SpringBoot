package project.TeamFive.ExLMS.assignment.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.dto.request.GradeRequest;
import project.TeamFive.ExLMS.assignment.dto.response.SubmissionResponseDTO;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.AssignmentGrade;
import project.TeamFive.ExLMS.assignment.entity.AssignmentSubmission;
import project.TeamFive.ExLMS.assignment.repository.AssignmentGradeRepository;
import project.TeamFive.ExLMS.assignment.repository.AssignmentRepository;
import project.TeamFive.ExLMS.assignment.repository.AssignmentSubmissionRepository;
import project.TeamFive.ExLMS.service.FileService;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradingService {

    private final AssignmentGradeRepository gradeRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FileService fileService;

    private void requireInstructorRole(Assignment assignment, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(assignment.getGroup().getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền chấm điểm!");
        }
    }

    @Transactional
    public SubmissionResponseDTO gradeSubmission(UUID submissionId, GradeRequest request, User grader) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        requireInstructorRole(submission.getAssignment(), grader);

        // Calculate penalty if late
        int finalScore = request.getScore();
        if (submission.isLate() && submission.getAssignment().getLatePenaltyPercent() > 0) {
            finalScore = (int) (finalScore * (100 - submission.getAssignment().getLatePenaltyPercent()) / 100.0);
        }

        AssignmentGrade grade = gradeRepository.findBySubmission_Id(submissionId)
                .orElse(AssignmentGrade.builder().submission(submission).build());

        grade.setGrader(grader);
        grade.setScore(finalScore);
        grade.setFeedback(request.getFeedback());
        grade.setStatus(request.getStatus() != null ? request.getStatus() : AssignmentGrade.GradeStatus.GRADED);
        grade.setGradedAt(LocalDateTime.now());

        gradeRepository.save(grade);
        
        // Map to response
        SubmissionResponseDTO dto = SubmissionResponseDTO.fromEntity(submission);
        dto.setScore(grade.getScore());
        dto.setFeedback(grade.getFeedback());
        dto.setGradeStatus(grade.getStatus().name());

        if (submission.getFileKey() != null) {
            dto.setFileUrl(fileService.getPresignedUrl(submission.getFileKey(), submission.getFileName()));
        }
        return dto;
    }

    @Transactional
    public void bulkGrade(Map<UUID, Integer> submissionScores, User grader) {
        for (Map.Entry<UUID, Integer> entry : submissionScores.entrySet()) {
            gradeSubmission(entry.getKey(), GradeRequest.builder().score(entry.getValue()).build(), grader);
        }
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponseDTO> getAllSubmissions(UUID assignmentId, User instructor) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        requireInstructorRole(assignment, instructor);

        return submissionRepository.findByAssignment_Id(assignmentId)
                .stream()
                .map(sub -> {
                    SubmissionResponseDTO dto = SubmissionResponseDTO.fromEntity(sub);
                    gradeRepository.findBySubmission_Id(sub.getId()).ifPresent(g -> {
                        dto.setScore(g.getScore());
                        dto.setFeedback(g.getFeedback());
                        dto.setGradeStatus(g.getStatus().name());
                    });
                    if (sub.getFileKey() != null) {
                        dto.setFileUrl(fileService.getPresignedUrl(sub.getFileKey(), sub.getFileName()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public byte[] exportToExcel(UUID assignmentId, User instructor) throws IOException {
        List<SubmissionResponseDTO> submissions = getAllSubmissions(assignmentId, instructor);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Grades");

            // Header row
            Row header = sheet.createRow(0);
            String[] columns = {"Student Name", "Email", "Submitted At", "Late", "Score", "Feedback"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (SubmissionResponseDTO sub : submissions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(sub.getStudentName());
                row.createCell(1).setCellValue("N/A"); // Should fetch student email if needed
                row.createCell(2).setCellValue(sub.getSubmittedAt().toString());
                row.createCell(3).setCellValue(sub.isLate() ? "Yes" : "No");
                row.createCell(4).setCellValue(sub.getScore() != null ? sub.getScore() : 0);
                row.createCell(5).setCellValue(sub.getFeedback() != null ? sub.getFeedback() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
