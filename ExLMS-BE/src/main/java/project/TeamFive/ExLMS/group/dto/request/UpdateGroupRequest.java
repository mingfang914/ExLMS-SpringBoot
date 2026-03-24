package project.TeamFive.ExLMS.group.dto.request;

import lombok.Data;

@Data
public class UpdateGroupRequest {
    private String name;
    private String description;
    private String visibility;
    private String category;
    private Boolean autoApprove;
}
