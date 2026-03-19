package project.TeamFive.ExLMS.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.TeamFive.ExLMS.auth.dto.request.LoginRequest;
import project.TeamFive.ExLMS.auth.dto.request.RegisterRequest;
import project.TeamFive.ExLMS.auth.dto.response.AuthResponse;
import project.TeamFive.ExLMS.user.entity.Role;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    public String register(RegisterRequest request) {
        // 1. Kiểm tra xem email đã bị ai đăng ký chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        // 2. Tạo đối tượng User mới (ID kiểu UUID v7 sẽ được BaseEntity tự động sinh ra)
        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword())) // Băm mật khẩu ra thành chuỗi loằng ngoằng
                .fullName(request.getFullName())
                .role(Role.STUDENT) // Mặc định sinh viên mới đăng ký
                .status("ACTIVE") // Tạm thời để active luôn, sau này bạn có thể làm tính năng xác thực email
                .emailVerified(false)
                .build();

        // 3. Lưu xuống Database
        userRepository.save(newUser);

        return "Đăng ký tài khoản thành công!";
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Spring Security sẽ tự động kiểm tra email và password có khớp trong DB không
        try {
        // Kiểm tra tài khoản
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        } catch (BadCredentialsException e) {
            // Nếu sai mật khẩu hoặc sai email, văng lỗi rõ ràng ra đây
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đăng nhập: " + e.getMessage());
        }

        // 2. Nếu code chạy xuống được đây nghĩa là mật khẩu đúng. Ta lấy User ra.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 3. Nhờ JwtService sinh ra cái thẻ Token
        String jwtToken = jwtService.generateToken(user);

        // 4. Trả về cho Frontend
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Đăng nhập thành công!")
                .build();
    }
}
