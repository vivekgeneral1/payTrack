package com.paytrack.subscription.dto;

import com.paytrack.common.enums.BillingCycle;
import com.paytrack.common.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionDto(
        UUID id,
        UUID categoryId,
        String providerName,
        String planName,
        BigDecimal cost,
        String currency,
        BillingCycle billingCycle,
        Integer customIntervalDays,
        LocalDate startDate,
        LocalDate nextRenewalDate,
        SubscriptionStatus status,
        boolean autoRenew,
        String cancellationUrl,
        String cancellationInstructions
) {
}
