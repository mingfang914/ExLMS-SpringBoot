package project.TeamFive.ExLMS.auth.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String role;
    private String message;
    private String fullName;
    private String avatarKey;
}
