package project.TeamFive.ExLMS.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException e, jakarta.servlet.http.HttpServletRequest request) {
        System.err.println("DEBUG: ResponseStatusException caught: " + e.getStatusCode() + " - " + e.getReason());
        System.err.println("DEBUG: Request URL: " + request.getRequestURL());
        System.err.println("DEBUG: Accept Header: " + request.getHeader("Accept"));
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getReason());
        return ResponseEntity.status(e.getStatusCode()).body(error);
    }

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
        System.err.println("DEBUG: NullPointerException caught:");
        e.printStackTrace();
        Map<String, String> error = new HashMap<>();
        error.put("message", "Đã xảy ra lỗi lập trình (NPE): " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        System.err.println("DEBUG: Unknown Exception caught: " + e.getMessage());
        e.printStackTrace();
        Map<String, String> error = new HashMap<>();
        error.put("message", "Đã xảy ra lỗi không mong muốn: " + e.getMessage());
        return ResponseEntity.internalServerError().body(error);
    }
}
