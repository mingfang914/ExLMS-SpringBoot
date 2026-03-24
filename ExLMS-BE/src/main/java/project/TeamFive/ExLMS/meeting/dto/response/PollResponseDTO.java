package project.TeamFive.ExLMS.meeting.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PollResponseDTO {
    private UUID id;
    private String question;
    private boolean active;
    private List<OptionDTO> options;
    private UUID userVotedOptionId; // ID of option the current user voted for

    @Data
    @Builder
    public static class OptionDTO {
        private UUID id;
        private String label;
        private int voteCount;
    }
}
