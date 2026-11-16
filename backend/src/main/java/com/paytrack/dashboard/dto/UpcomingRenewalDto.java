package com.paytrack.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingRenewalDto(UUID subscriptionId, String providerName, BigDecimal cost, String currency,
                                  LocalDate nextRenewalDate, long daysUntil) {
}
