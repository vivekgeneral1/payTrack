package com.paytrack.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CancellationDto(
        UUID id,
        Instant cancelledAt,
        LocalDate effectiveDate,
        String reason,
        BigDecimal refundAmount,
        String notes
) {
}
