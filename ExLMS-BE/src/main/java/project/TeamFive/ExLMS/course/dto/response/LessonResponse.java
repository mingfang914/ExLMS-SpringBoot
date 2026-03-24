package project.TeamFive.ExLMS.course.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class LessonResponse {
    private UUID id;
    private UUID chapterId;
    private String title;
    private String contentType;
    private String content;
    private String resourceKey;
    private Integer durationSeconds;
    private int orderIndex;
}
