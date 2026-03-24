package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;

@Data
public class ChapterRequest {
    private String title;
    private String description;
    private Boolean locked;
}
