package project.TeamFive.ExLMS.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.resource-bucket:lms-resources}")
    private String resourceBucket;

    @jakarta.annotation.PostConstruct
    public void initBucket() {
        initSingleBucket(bucketName);
        initSingleBucket(resourceBucket);
    }

    private void initSingleBucket(String name) {
        try {
            boolean found = minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(name).build());
            if (!found) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(name).build());
                log.info("Bucket created successfully: {}", name);
            }
        } catch (Exception e) {
            log.error("Error initializing Minio bucket {}: {}", name, e.getMessage());
        }
    }

    public String uploadFile(MultipartFile file) {
        // CHAR(36) DB Limit - use only the 36-char UUID, MinIO will map the MIME type under the hood
        String objectKey = UUID.randomUUID().toString();
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectKey;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to MinIO: " + e.getMessage());
        }
    }

    public void deleteFile(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) return;
        try {
            minioClient.removeObject(io.minio.RemoveObjectArgs.builder().bucket(bucketName).object(objectKey).build());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from MinIO: " + e.getMessage());
        }
    }

    public String updateFile(String oldKey, MultipartFile newFile) {
        if (oldKey != null && !oldKey.isEmpty()) {
            deleteFile(oldKey);
        }
        return uploadFile(newFile);
    }


    public String getPresignedUrl(String objectKey) {
        return getPresignedUrl(bucketName, objectKey, null);
    }

    public String getPresignedUrl(String objectKey, String filename) {
        return getPresignedUrl(bucketName, objectKey, filename);
    }

    public String getPresignedUrl(String bucket, String objectKey, String filename) {
        if (objectKey == null) return null;
        try {
            GetPresignedObjectUrlArgs.Builder builder = GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectKey)
                    .expiry(2, TimeUnit.HOURS);

            if (filename != null && !filename.isEmpty()) {
                builder.extraQueryParams(Map.of("response-content-disposition", "attachment; filename=\"" + filename + "\""));
            }

            return minioClient.getPresignedObjectUrl(builder.build());
        } catch (Exception e) {
            throw new RuntimeException("Error generating presigned URL: " + e.getMessage());
        }
    }

    // --- CKEditor Resource Methods ---
    public String uploadResource(MultipartFile file) {
        String objectKey = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(resourceBucket)
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectKey;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading resource: " + e.getMessage());
        }
    }

    public io.minio.GetObjectResponse getResource(String objectKey) {
        try {
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(resourceBucket)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving resource: " + e.getMessage());
        }
    }

    public io.minio.GetObjectResponse downloadFile(String objectKey) {
        try {
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving file: " + e.getMessage());
        }
    }
}
