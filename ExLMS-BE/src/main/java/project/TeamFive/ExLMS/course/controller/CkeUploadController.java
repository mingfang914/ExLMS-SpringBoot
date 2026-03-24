package project.TeamFive.ExLMS.course.controller;

import io.minio.GetObjectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.TeamFive.ExLMS.service.FileService;

import java.util.Map;

@RestController
@RequestMapping("/api/cke")
@RequiredArgsConstructor
public class CkeUploadController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("upload") MultipartFile file) {
        try {
            String objectKey = fileService.uploadResource(file);
            // Construct the URL that pointing back to our proxy endpoint
            String url = "/api/cke/resources/" + objectKey;
            
            return ResponseEntity.ok(Map.of(
                "url", url,
                "uploaded", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "uploaded", false,
                "error", Map.of("message", e.getMessage())
            ));
        }
    }

    @GetMapping("/resources/{objectKey}")
    public ResponseEntity<InputStreamResource> getResource(@PathVariable String objectKey) {
        try {
            GetObjectResponse response = fileService.getResource(objectKey);
            String contentType = response.headers().get("Content-Type");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + objectKey + "\"")
                    .body(new InputStreamResource(response));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
