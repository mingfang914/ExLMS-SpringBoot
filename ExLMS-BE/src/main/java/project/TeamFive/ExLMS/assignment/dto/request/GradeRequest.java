package project.TeamFive.ExLMS.assignment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.AssignmentGrade;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeRequest {
    private int score;
    private String feedback;
    private AssignmentGrade.GradeStatus status;
}
