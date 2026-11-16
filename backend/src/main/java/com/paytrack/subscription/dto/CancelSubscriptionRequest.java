package com.paytrack.subscription.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CancelSubscriptionRequest(
        String reason,
        LocalDate effectiveDate,
        BigDecimal refundAmount,
        String notes
) {
}
