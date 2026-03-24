package project.TeamFive.ExLMS.meeting.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePollRequest {
    private String question;
    private List<String> options;
}
