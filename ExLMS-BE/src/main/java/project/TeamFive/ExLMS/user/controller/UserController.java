package project.TeamFive.ExLMS.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.dto.request.ProfileUpdateRequest;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;
import project.TeamFive.ExLMS.service.FileService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FileService fileService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(@AuthenticationPrincipal User currentUser) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", currentUser.getId());
        response.put("email", currentUser.getEmail());
        response.put("fullName", currentUser.getFullName());
        response.put("name", currentUser.getFullName()); // For frontend backwards compatibility
        response.put("bio", currentUser.getBio());
        response.put("role", currentUser.getRole() != null ? currentUser.getRole().name() : null);
        response.put("status", currentUser.getStatus());
        
        String avatarUrl = null;
        if (currentUser.getAvatarKey() != null && !currentUser.getAvatarKey().trim().isEmpty()) {
            try {
                avatarUrl = fileService.getPresignedUrl(currentUser.getAvatarKey());
            } catch (Exception e) {}
        }
        response.put("avatarKey", currentUser.getAvatarKey());
        response.put("avatarUrl", avatarUrl);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<String> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ProfileUpdateRequest request) {
        
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarKey() != null) {
            user.setAvatarKey(request.getAvatarKey());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Cập nhật hồ sơ thành công!");
    }
}
