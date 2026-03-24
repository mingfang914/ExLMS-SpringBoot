package project.TeamFive.ExLMS.auth.controller;

import project.TeamFive.ExLMS.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import project.TeamFive.ExLMS.auth.dto.request.RegisterRequest;
import project.TeamFive.ExLMS.auth.dto.request.LoginRequest;
import project.TeamFive.ExLMS.auth.dto.response.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        String responseMessage = authService.register(request);
        return ResponseEntity.ok(responseMessage); // Trả về HTTP Status 200 OK
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.refreshToken(token));
    }

}
