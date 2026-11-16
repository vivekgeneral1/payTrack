package com.paytrack.payment.dto;

import com.paytrack.common.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentDto(
        UUID id,
        UUID categoryId,
        UUID subscriptionId,
        String title,
        BigDecimal amount,
        String currency,
        LocalDate dueDate,
        LocalDate paidDate,
        PaymentStatus status,
        boolean recurring,
        String recurrenceRule,
        String notes
) {
}
