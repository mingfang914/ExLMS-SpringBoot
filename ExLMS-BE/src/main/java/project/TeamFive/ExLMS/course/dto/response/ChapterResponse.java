package project.TeamFive.ExLMS.course.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ChapterResponse {
    private UUID id;
    private String title;
    private String description;
    private int orderIndex;
    private boolean locked;
}
