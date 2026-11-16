package com.paytrack.subscription.dto;

import com.paytrack.common.enums.BillingCycle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionRequest(
        UUID categoryId,
        @NotBlank String providerName,
        String planName,
        @NotNull @Positive BigDecimal cost,
        @NotBlank String currency,
        @NotNull BillingCycle billingCycle,
        Integer customIntervalDays,
        @NotNull LocalDate startDate,
        @NotNull LocalDate nextRenewalDate,
        boolean autoRenew,
        String cancellationUrl,
        String cancellationInstructions
) {
}
