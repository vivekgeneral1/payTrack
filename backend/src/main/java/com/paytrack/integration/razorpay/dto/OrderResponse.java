package com.paytrack.integration.razorpay.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String razorpayOrderId,
        String razorpayKeyId,
        BigDecimal amount,
        String currency,
        String status
) {
}
