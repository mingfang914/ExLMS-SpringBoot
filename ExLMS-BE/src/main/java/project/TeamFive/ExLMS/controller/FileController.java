package project.TeamFive.ExLMS.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.TeamFive.ExLMS.service.FileService;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        // Axios expects the raw string if the frontend parses response.data directly without an object wrapper
        String objectKey = fileService.uploadFile(file);
        return ResponseEntity.ok(objectKey);
    }

    @GetMapping("/download-url/{fileKey}")
    public ResponseEntity<String> getDownloadUrl(@PathVariable String fileKey) {
        String url = fileService.getPresignedUrl(fileKey);
        return ResponseEntity.ok(url);
    }

    @GetMapping("/download/{fileKey}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable String fileKey) {
        try {
            io.minio.GetObjectResponse response = fileService.downloadFile(fileKey);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, response.headers().get("Content-Type"))
                    .body(new org.springframework.core.io.InputStreamResource(response));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{fileKey}")
    public ResponseEntity<Map<String, String>> updateFile(@PathVariable String fileKey, @RequestParam("file") MultipartFile file) {
        String newKey = fileService.updateFile(fileKey, file);
        String url = fileService.getPresignedUrl(newKey);
        return ResponseEntity.ok(Map.of("fileKey", newKey, "url", url));
    }

    @DeleteMapping("/{fileKey}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileKey) {
        fileService.deleteFile(fileKey);
        return ResponseEntity.ok("File deleted successfully");
    }
}
