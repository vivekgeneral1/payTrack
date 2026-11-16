package com.paytrack.subscription;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.enums.SubscriptionStatus;
import com.paytrack.security.CurrentUserId;
import com.paytrack.subscription.dto.CancelSubscriptionRequest;
import com.paytrack.subscription.dto.CancellationDto;
import com.paytrack.subscription.dto.SubscriptionDto;
import com.paytrack.subscription.dto.SubscriptionRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public PageResponse<SubscriptionDto> list(@CurrentUserId UUID userId,
                                               @RequestParam(required = false) SubscriptionStatus status,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return subscriptionService.list(userId, status, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public SubscriptionDto getOne(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return subscriptionService.getOne(userId, id);
    }

    @PostMapping
    public ResponseEntity<SubscriptionDto> create(@CurrentUserId UUID userId, @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.create(userId, request));
    }

    @PutMapping("/{id}")
    public SubscriptionDto update(@CurrentUserId UUID userId, @PathVariable UUID id, @Valid @RequestBody SubscriptionRequest request) {
        return subscriptionService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@CurrentUserId UUID userId, @PathVariable UUID id) {
        subscriptionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancel")
    public SubscriptionDto cancel(@CurrentUserId UUID userId, @PathVariable UUID id,
                                   @RequestBody(required = false) CancelSubscriptionRequest request) {
        return subscriptionService.cancel(userId, id, request != null ? request : new CancelSubscriptionRequest(null, null, null, null));
    }

    @GetMapping("/{id}/cancellations")
    public List<CancellationDto> cancellations(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return subscriptionService.cancellationHistory(userId, id);
    }
}
