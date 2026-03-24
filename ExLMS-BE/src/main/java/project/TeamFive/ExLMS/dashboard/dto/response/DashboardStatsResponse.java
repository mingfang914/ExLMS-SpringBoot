package project.TeamFive.ExLMS.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long joinedGroups;
    private long coursesInProgress;
    private long pendingAssignments;
    private long upcomingMeetings;
}
