package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    private String contentType; // VIDEO, DOCUMENT, EMBED, FILE
    private String content;     // rich text / embed code / youtube url
    private String resourceKey; // MinIO key for uploaded file
    private Integer durationSeconds;
}
