package com.paytrack.dashboard;

import com.paytrack.dashboard.dto.CategoryBreakdownDto;
import com.paytrack.dashboard.dto.DashboardSummaryDto;
import com.paytrack.dashboard.dto.TimeSeriesPointDto;
import com.paytrack.dashboard.dto.UpcomingRenewalDto;
import com.paytrack.security.CurrentUserId;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDto summary(@CurrentUserId UUID userId) {
        return dashboardService.summary(userId);
    }

    @GetMapping("/spending-over-time")
    public List<TimeSeriesPointDto> spendingOverTime(@CurrentUserId UUID userId,
                                                      @RequestParam(defaultValue = "6") int months) {
        return dashboardService.spendingOverTime(userId, months);
    }

    @GetMapping("/category-breakdown")
    public List<CategoryBreakdownDto> categoryBreakdown(@CurrentUserId UUID userId,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return dashboardService.categoryBreakdown(userId, from, to);
    }

    @GetMapping("/subscription-cost-trends")
    public List<TimeSeriesPointDto> subscriptionCostTrends(@CurrentUserId UUID userId,
                                                             @RequestParam(defaultValue = "6") int months) {
        return dashboardService.subscriptionCostTrend(userId, months);
    }

    @GetMapping("/upcoming-renewals")
    public List<UpcomingRenewalDto> upcomingRenewals(@CurrentUserId UUID userId) {
        return dashboardService.upcomingRenewals(userId);
    }
}
