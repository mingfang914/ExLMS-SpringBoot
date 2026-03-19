package project.TeamFive.ExLMS.group.dto.request;

import lombok.Data;

@Data
public class CreateGroupRequest {
    private String name;
    private String description;
    private String visibility; // Truyền vào "PUBLIC" hoặc "PRIVATE"
    private String category;
    private String coverKey;
}
