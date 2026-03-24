package project.TeamFive.ExLMS.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Đây là chữ ký bí mật của Server (Tuyệt đối không để lộ). 
    // Trong thực tế, chuỗi này phải được lưu trong file cấu hình application.yml
    private static final String SECRET_KEY = "VGhpcy1pcy1hLXZlcnktc2VjdXJlLWtleS1mb3ItZXhsbXMtYmFja2VuZC1wcm9qZWN0LXRlYW0tZml2ZQ==";

    // Hàm tạo Access Token (hạn 15 phút)
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername()) // Lưu email vào token
                .issuedAt(new Date(System.currentTimeMillis())) // Thời gian phát hành
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 15)) // Hạn sử dụng: 15 phút
                .signWith(getSignInKey()) // Ký xác nhận bằng Secret Key
                .compact();
    }

    // Hàm tạo Refresh Token (hạn 7 ngày)
    public String generateRefreshToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // Hạn sử dụng: 7 ngày
                .signWith(getSignInKey())
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Lấy Email (Username) từ trong Token ra
    public String extractUsername(String token) {
        return extractClaim(token, io.jsonwebtoken.Claims::getSubject);
    }

    // Kiểm tra Token có hợp lệ với User hiện tại không
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // Kiểm tra xem Token đã hết hạn chưa
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, io.jsonwebtoken.Claims::getExpiration);
    }

    public <T> T extractClaim(String token, java.util.function.Function<io.jsonwebtoken.Claims, T> claimsResolver) {
        final io.jsonwebtoken.Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Đọc toàn bộ dữ liệu (Claims) đã được mã hóa trong Token
    private io.jsonwebtoken.Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Dùng chìa khóa bí mật để giải mã
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
