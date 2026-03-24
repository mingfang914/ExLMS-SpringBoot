package project.TeamFive.ExLMS.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.TeamFive.ExLMS.dashboard.dto.response.DashboardStatsResponse;
import project.TeamFive.ExLMS.dashboard.service.DashboardService;
import project.TeamFive.ExLMS.user.entity.User;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getMyStats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getUserStats(currentUser));
    }
}
