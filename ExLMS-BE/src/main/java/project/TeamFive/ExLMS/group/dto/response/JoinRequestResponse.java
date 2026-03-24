package project.TeamFive.ExLMS.group.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class JoinRequestResponse {
    private UUID requestId;
    private String studentName;
    private String studentEmail;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
