package project.TeamFive.ExLMS.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthenticationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Bạn không có quyền thực hiện hành động này.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, String>> handleNullPointerException(NullPointerException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Đã xảy ra lỗi không mong muốn: " + e.getMessage());
        return ResponseEntity.internalServerError().body(error);
    }
}
