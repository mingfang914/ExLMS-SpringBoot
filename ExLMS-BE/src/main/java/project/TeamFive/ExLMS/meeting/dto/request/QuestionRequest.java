package project.TeamFive.ExLMS.meeting.dto.request;

import lombok.Data;

@Data
public class QuestionRequest {
    private String content;
    private boolean isPrivate;
}
