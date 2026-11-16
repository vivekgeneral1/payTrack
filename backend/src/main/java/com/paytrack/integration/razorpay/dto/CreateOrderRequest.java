package com.paytrack.integration.razorpay.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateOrderRequest(
        @NotNull @Positive BigDecimal amount,
        @NotNull String currency,
        UUID paymentId,
        UUID subscriptionId
) {
}
