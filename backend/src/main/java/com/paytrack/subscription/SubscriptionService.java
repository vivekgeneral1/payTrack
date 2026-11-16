package com.paytrack.subscription;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.enums.NotificationChannel;
import com.paytrack.common.enums.NotificationType;
import com.paytrack.common.enums.RelatedEntityType;
import com.paytrack.common.enums.SubscriptionStatus;
import com.paytrack.common.exception.BadRequestException;
import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.integration.googlecalendar.CalendarSyncService;
import com.paytrack.notification.NotificationService;
import com.paytrack.subscription.dto.CancelSubscriptionRequest;
import com.paytrack.subscription.dto.CancellationDto;
import com.paytrack.subscription.dto.SubscriptionDto;
import com.paytrack.subscription.dto.SubscriptionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionCancellationRepository cancellationRepository;
    private final CalendarSyncService calendarSyncService;
    private final NotificationService notificationService;

    public PageResponse<SubscriptionDto> list(UUID userId, SubscriptionStatus status, Pageable pageable) {
        Page<Subscription> page = status != null
                ? subscriptionRepository.findByUserIdAndStatus(userId, status, pageable)
                : subscriptionRepository.findByUserId(userId, pageable);
        return PageResponse.from(page.map(this::toDto));
    }

    public SubscriptionDto getOne(UUID userId, UUID id) {
        return toDto(findOwned(userId, id));
    }

    @Transactional
    public SubscriptionDto create(UUID userId, SubscriptionRequest request) {
        Subscription subscription = Subscription.builder()
                .userId(userId)
                .categoryId(request.categoryId())
                .providerName(request.providerName())
                .planName(request.planName())
                .cost(request.cost())
                .currency(request.currency())
                .billingCycle(request.billingCycle())
                .customIntervalDays(request.customIntervalDays())
                .startDate(request.startDate())
                .nextRenewalDate(request.nextRenewalDate())
                .autoRenew(request.autoRenew())
                .cancellationUrl(request.cancellationUrl())
                .cancellationInstructions(request.cancellationInstructions())
                .status(SubscriptionStatus.ACTIVE)
                .build();
        subscription = subscriptionRepository.save(subscription);
        syncCalendar(subscription);
        return toDto(subscription);
    }

    @Transactional
    public SubscriptionDto update(UUID userId, UUID id, SubscriptionRequest request) {
        Subscription subscription = findOwned(userId, id);
        subscription.setCategoryId(request.categoryId());
        subscription.setProviderName(request.providerName());
        subscription.setPlanName(request.planName());
        subscription.setCost(request.cost());
        subscription.setCurrency(request.currency());
        subscription.setBillingCycle(request.billingCycle());
        subscription.setCustomIntervalDays(request.customIntervalDays());
        subscription.setStartDate(request.startDate());
        subscription.setNextRenewalDate(request.nextRenewalDate());
        subscription.setAutoRenew(request.autoRenew());
        subscription.setCancellationUrl(request.cancellationUrl());
        subscription.setCancellationInstructions(request.cancellationInstructions());
        subscription = subscriptionRepository.save(subscription);
        syncCalendar(subscription);
        return toDto(subscription);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Subscription subscription = findOwned(userId, id);
        calendarSyncService.deleteEvent(userId, RelatedEntityType.SUBSCRIPTION, subscription.getId());
        subscriptionRepository.delete(subscription);
    }

    @Transactional
    public SubscriptionDto cancel(UUID userId, UUID id, CancelSubscriptionRequest request) {
        Subscription subscription = findOwned(userId, id);
        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new BadRequestException("Subscription is already cancelled");
        }
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setAutoRenew(false);
        subscriptionRepository.save(subscription);

        LocalDate effectiveDate = request.effectiveDate() != null ? request.effectiveDate() : LocalDate.now();
        SubscriptionCancellation cancellation = SubscriptionCancellation.builder()
                .subscriptionId(subscription.getId())
                .userId(userId)
                .effectiveDate(effectiveDate)
                .reason(request.reason())
                .refundAmount(request.refundAmount())
                .notes(request.notes())
                .build();
        cancellationRepository.save(cancellation);

        calendarSyncService.deleteEvent(userId, RelatedEntityType.SUBSCRIPTION, subscription.getId());

        notificationService.notify(
                userId,
                NotificationType.SUBSCRIPTION_CANCELLED,
                subscription.getProviderName() + " cancelled",
                "Effective " + effectiveDate + (request.reason() != null ? ". Reason: " + request.reason() : ""),
                RelatedEntityType.SUBSCRIPTION,
                subscription.getId(),
                NotificationChannel.BOTH,
                "subscription-cancelled",
                Map.of("providerName", subscription.getProviderName(), "effectiveDate", effectiveDate.toString(),
                        "reason", request.reason() != null ? request.reason() : ""));

        return toDto(subscription);
    }

    public List<CancellationDto> cancellationHistory(UUID userId, UUID id) {
        findOwned(userId, id);
        return cancellationRepository.findBySubscriptionIdOrderByCancelledAtDesc(id).stream()
                .map(c -> new CancellationDto(c.getId(), c.getCancelledAt(), c.getEffectiveDate(), c.getReason(),
                        c.getRefundAmount(), c.getNotes()))
                .toList();
    }

    private void syncCalendar(Subscription subscription) {
        if (subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            calendarSyncService.upsertEvent(subscription.getUserId(), RelatedEntityType.SUBSCRIPTION, subscription.getId(),
                    subscription.getProviderName() + " renews",
                    subscription.getCurrency() + " " + subscription.getCost(), subscription.getNextRenewalDate());
        }
    }

    private Subscription findOwned(UUID userId, UUID id) {
        return subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }

    private SubscriptionDto toDto(Subscription s) {
        return new SubscriptionDto(s.getId(), s.getCategoryId(), s.getProviderName(), s.getPlanName(), s.getCost(),
                s.getCurrency(), s.getBillingCycle(), s.getCustomIntervalDays(), s.getStartDate(),
                s.getNextRenewalDate(), s.getStatus(), s.isAutoRenew(), s.getCancellationUrl(),
                s.getCancellationInstructions());
    }
}
