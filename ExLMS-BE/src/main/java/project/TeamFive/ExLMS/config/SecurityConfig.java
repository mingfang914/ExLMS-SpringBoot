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
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/cke/resources/**", "/error").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/instructor/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/v1/forum/tags").permitAll()
                .requestMatchers("/api/v1/forum/**").authenticated()
                .requestMatchers("/api/v1/courses/**").authenticated()
                .requestMatchers("/api/courses/**").authenticated()
                .requestMatchers("/api/groups/**").authenticated()
                .requestMatchers("/api/v1/quizzes/**").authenticated()
                .requestMatchers("/api/v1/assignments/**").authenticated()
                .requestMatchers("/api/v1/meetings/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
