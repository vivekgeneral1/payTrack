package com.paytrack.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummaryDto(
        BigDecimal totalSpendThisMonth,
        long activeSubscriptionsCount,
        BigDecimal estimatedMonthlySubscriptionCost,
        long upcomingRenewalsNext30Days,
        long pendingPaymentsCount,
        BigDecimal totalPendingAmount,
        long cancelledSubscriptionsCount
) {
}
