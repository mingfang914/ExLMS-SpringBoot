package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String status;
    private String thumbnailKey;
}
