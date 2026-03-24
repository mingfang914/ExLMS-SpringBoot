package project.TeamFive.ExLMS.user.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String bio;
    private String avatarKey;
}
