package project.TeamFive.ExLMS.meeting.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class QuestionResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private String content;
    private String answer;
    private String answeredByName;
    private boolean answered;
    private boolean isPrivate;
    private LocalDateTime createdAt;
}
