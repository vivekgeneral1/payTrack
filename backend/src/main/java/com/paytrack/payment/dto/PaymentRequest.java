package com.paytrack.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentRequest(
        UUID categoryId,
        UUID subscriptionId,
        @NotBlank String title,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String currency,
        @NotNull LocalDate dueDate,
        boolean recurring,
        String recurrenceRule,
        String notes
) {
}
