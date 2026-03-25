package project.TeamFive.ExLMS.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.user.dto.response.UserResponse;
import project.TeamFive.ExLMS.user.entity.Role;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> usersPage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            usersPage = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(this::mapToResponse);
    }

    @Transactional
    public String changeUserStatus(UUID userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        
        // Nếu chuyển sang ACTIVE, reset các thông số khóa
        if ("ACTIVE".equalsIgnoreCase(status)) {
            user.setFailedLoginCount(0);
            user.setLockedUntil(null);
        }
        
        user.setStatus(status.toUpperCase());
        userRepository.save(user);
        return "Cập nhật trạng thái thành công!";
    }

    @Transactional
    public String changeUserRole(UUID userId, String roleStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        try {
            Role role = Role.valueOf(roleStr.toUpperCase());
            user.setRole(role);
            userRepository.save(user);
            return "Cập nhật quyền thành công!";
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Quyền (Role) không hợp lệ!");
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> exportAllUsers() {
        return userRepository.findAll(Sort.by("createdAt").descending())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .failedLoginCount(user.getFailedLoginCount())
                .lockedUntil(user.getLockedUntil())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
