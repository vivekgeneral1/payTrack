package com.paytrack.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceUploadMetadata(
        UUID paymentId,
        UUID subscriptionId,
        String invoiceNumber,
        LocalDate invoiceDate,
        BigDecimal amount,
        String vendorName
) {
}
