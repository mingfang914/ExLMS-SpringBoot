package project.TeamFive.ExLMS.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.user.entity.UserSession;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findByRefreshToken(String refreshToken);
    
    // Xóa session khi người dùng đăng xuất thủ công
    void deleteByRefreshToken(String refreshToken);

    // Xóa tất cả session của 1 user (VD: khi bị đổi mật khẩu hoặc bị khóa)
    void deleteByUserId(UUID userId);
}
