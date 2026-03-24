package project.TeamFive.ExLMS.assignment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequest {
    private Assignment.SubmissionType submissionType;
    private String textContent;
    private String externalUrl;
    // file_key, file_name, file_size will be handled via MultipartFile in controller
}
