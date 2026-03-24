package project.TeamFive.ExLMS.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import project.TeamFive.ExLMS.auth.service.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.startsWith("/api/ws") || path.startsWith("/ws");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Lấy Header có tên là "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. Nếu không có Header này, hoặc không bắt đầu bằng "Bearer ", thì bỏ qua cho đi tiếp (có thể là API Login/Register)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Cắt chữ "Bearer " (7 ký tự đầu) để lấy chuỗi Token thật sự
        jwt = authHeader.substring(7);
        
        try {
            // Lấy email từ token ra
            userEmail = jwtService.extractUsername(jwt);
            
            // 4. Nếu có email và user chưa được xác thực trong ngữ cảnh hiện tại
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Lấy thông tin user từ Database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                // 5. Nếu Token hợp lệ, tạo một giấy thông hành (Authentication) và cấp cho SecurityContext
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Lưu vào Context, từ nay API sẽ biết ai đang gọi
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token hết hạn hoặc sai chữ ký sẽ rơi vào đây, ta cứ kệ cho Filter đi tiếp, nó sẽ bị chặn ở cổng SecurityConfig báo lỗi 403
            System.out.println("Lỗi xử lý JWT: " + e.getMessage());
        }

        // 6. Cho phép Request đi tiếp vào Controller
        filterChain.doFilter(request, response);
    }
}