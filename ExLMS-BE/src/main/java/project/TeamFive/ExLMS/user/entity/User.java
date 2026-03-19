package project.TeamFive.ExLMS.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import project.TeamFive.ExLMS.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    // Sử dụng avatar_key theo chuẩn bảo mật MinIO của bạn
    @Column(name = "avatar_key", length = 36)
    private String avatarKey;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Lưu Enum xuống DB dưới dạng chuỗi Text (ADMIN, INSTRUCTOR, STUDENT)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT; 

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "verification_token", length = 128)
    private String verificationToken;

    @Column(name = "reset_token", length = 128)
    private String resetToken;

    @Column(name = "reset_token_expires")
    private LocalDateTime resetTokenExpires;

    @Column(name = "failed_login_count", nullable = false)
    private int failedLoginCount = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Transient
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Cấp quyền cho user dựa trên Enum Role (VD: ROLE_STUDENT)
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Transient
    @Override
    public String getPassword() {
        return passwordHash; // Trả về mật khẩu đã băm
    }

    @Transient
    @Override
    public String getUsername() {
        return email; // Dùng email làm tài khoản đăng nhập
    }

    @Transient
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Transient
    @Override
    public boolean isAccountNonLocked() {
        // Mở khóa nếu cột lockedUntil bị null hoặc thời gian khóa đã qua
        return lockedUntil == null || lockedUntil.isBefore(LocalDateTime.now());
    }

    @Transient
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Transient
    @Override
    public boolean isEnabled() {
        return true;
    }
}
