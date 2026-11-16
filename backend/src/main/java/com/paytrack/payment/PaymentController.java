package com.paytrack.payment;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.enums.PaymentStatus;
import com.paytrack.payment.dto.PaymentDto;
import com.paytrack.payment.dto.PaymentRequest;
import com.paytrack.security.CurrentUserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public PageResponse<PaymentDto> search(@CurrentUserId UUID userId,
                                            @RequestParam(required = false) PaymentStatus status,
                                            @RequestParam(required = false) UUID categoryId,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return paymentService.search(userId, status, categoryId, from, to, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public PaymentDto getOne(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return paymentService.getOne(userId, id);
    }

    @PostMapping
    public ResponseEntity<PaymentDto> create(@CurrentUserId UUID userId, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.create(userId, request));
    }

    @PutMapping("/{id}")
    public PaymentDto update(@CurrentUserId UUID userId, @PathVariable UUID id, @Valid @RequestBody PaymentRequest request) {
        return paymentService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@CurrentUserId UUID userId, @PathVariable UUID id) {
        paymentService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/mark-paid")
    public PaymentDto markPaid(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return paymentService.markPaid(userId, id);
    }
}
