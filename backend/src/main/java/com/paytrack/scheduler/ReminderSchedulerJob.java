package com.paytrack.scheduler;

import com.paytrack.common.enums.NotificationChannel;
import com.paytrack.common.enums.NotificationType;
import com.paytrack.common.enums.RelatedEntityType;
import com.paytrack.notification.NotificationService;
import com.paytrack.payment.Payment;
import com.paytrack.payment.PaymentRepository;
import com.paytrack.subscription.Subscription;
import com.paytrack.subscription.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Daily job that reminds users about upcoming subscription renewals and payment due dates.
 * Dedup is enforced by the unique (entity_type, entity_id, offset_days) constraint on reminder_log,
 * so even an overlapping/duplicate run can never double-send the same reminder.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderSchedulerJob {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final NotificationService notificationService;

    @Value("${paytrack.reminders.offsets-days}")
    private String offsetsDaysConfig;

    @Scheduled(cron = "${paytrack.reminders.cron}")
    public void run() {
        List<Integer> offsets = Arrays.stream(offsetsDaysConfig.split(",")).map(String::trim).map(Integer::parseInt).toList();
        LocalDate today = LocalDate.now();
        for (int offset : offsets) {
            LocalDate targetDate = today.plusDays(offset);
            remindSubscriptions(targetDate, offset);
            remindPayments(targetDate, offset);
        }
    }

    @Transactional
    protected void remindSubscriptions(LocalDate targetDate, int offset) {
        List<Subscription> renewing = subscriptionRepository.findActiveRenewingBetween(targetDate, targetDate);
        for (Subscription subscription : renewing) {
            sendOnce(RelatedEntityType.SUBSCRIPTION, subscription.getId(), offset, () ->
                    notificationService.notify(
                            subscription.getUserId(),
                            NotificationType.RENEWAL_REMINDER,
                            subscription.getProviderName() + " renews in " + offset + " day(s)",
                            subscription.getCurrency() + " " + subscription.getCost() + " on " + subscription.getNextRenewalDate(),
                            RelatedEntityType.SUBSCRIPTION,
                            subscription.getId(),
                            NotificationChannel.BOTH,
                            "renewal-reminder",
                            Map.of("title", subscription.getProviderName() + " renews in " + offset + " day(s)",
                                    "providerName", subscription.getProviderName(),
                                    "daysUntil", offset,
                                    "amount", subscription.getCost(),
                                    "currency", subscription.getCurrency(),
                                    "renewalDate", subscription.getNextRenewalDate().toString())));
        }
    }

    @Transactional
    protected void remindPayments(LocalDate targetDate, int offset) {
        List<Payment> due = paymentRepository.findPendingDueBetween(targetDate, targetDate);
        for (Payment payment : due) {
            sendOnce(RelatedEntityType.PAYMENT, payment.getId(), offset, () ->
                    notificationService.notify(
                            payment.getUserId(),
                            NotificationType.INVOICE_DUE,
                            payment.getTitle() + " is due in " + offset + " day(s)",
                            payment.getCurrency() + " " + payment.getAmount() + " due " + payment.getDueDate(),
                            RelatedEntityType.PAYMENT,
                            payment.getId(),
                            NotificationChannel.BOTH,
                            "invoice-due",
                            Map.of("title", payment.getTitle() + " is due soon",
                                    "paymentTitle", payment.getTitle(),
                                    "daysUntil", offset,
                                    "amount", payment.getAmount(),
                                    "currency", payment.getCurrency(),
                                    "dueDate", payment.getDueDate().toString())));
        }
    }

    private void sendOnce(RelatedEntityType entityType, java.util.UUID entityId, int offset, Runnable action) {
        if (reminderLogRepository.existsByEntityTypeAndEntityIdAndOffsetDays(entityType, entityId, offset)) {
            return;
        }
        try {
            reminderLogRepository.save(ReminderLog.builder().entityType(entityType).entityId(entityId).offsetDays(offset).build());
            action.run();
        } catch (DataIntegrityViolationException e) {
            log.debug("Reminder for {} {} at offset {} already sent concurrently, skipping", entityType, entityId, offset);
        }
    }
}
