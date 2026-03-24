package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String status;
    private String thumbnailKey;
    private LocalDate startDate;
    private LocalDate endDate;
}
