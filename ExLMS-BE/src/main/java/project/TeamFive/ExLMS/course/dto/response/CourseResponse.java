package project.TeamFive.ExLMS.course.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class CourseResponse {
    private UUID id;
    private String title;
    private String description;
    private String status;
    private UUID groupId;
    private String thumbnailUrl;
}
