package project.TeamFive.ExLMS.user.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private boolean emailVerified;
    private int failedLoginCount;
    private LocalDateTime lockedUntil;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
