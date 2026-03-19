package project.TeamFive.ExLMS.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // Thêm annotation này
public class SecurityConfig {

    // Tiêm (Inject) Filter và Provider vào
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/instructor/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/v1/forum/tags").permitAll()
                .requestMatchers("/api/v1/forum/**").authenticated()
                .requestMatchers("/api/v1/courses/**").authenticated()
                .requestMatchers("/api/v1/quizzes/**").authenticated()
                .requestMatchers("/api/v1/assignments/**").authenticated()
                .requestMatchers("/api/v1/meetings/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            // Cấu hình không lưu Session (STATELESS) vì chúng ta dùng JWT
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            // Nhét JwtAuthenticationFilter vào trước cái Filter mặc định của Spring
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}