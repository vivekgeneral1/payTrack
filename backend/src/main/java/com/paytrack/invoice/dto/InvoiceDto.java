package com.paytrack.invoice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceDto(
        UUID id,
        UUID paymentId,
        UUID subscriptionId,
        String originalFilename,
        String contentType,
        long sizeBytes,
        String invoiceNumber,
        LocalDate invoiceDate,
        BigDecimal amount,
        String vendorName,
        Instant uploadedAt
) {
}
