package project.TeamFive.ExLMS.group.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GroupResponse {
    private UUID id;
    private String name;
    private String description;
    private String ownerName;
    private String visibility;
    private int memberCount;
    private String category;
    private String status;
    private String coverUrl;
    private String currentUserRole;
    private String inviteCode;
    @com.fasterxml.jackson.annotation.JsonProperty("isJoined")
    private boolean isJoined;
}
