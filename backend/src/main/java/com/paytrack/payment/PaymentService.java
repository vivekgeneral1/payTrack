package com.paytrack.payment;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.enums.NotificationChannel;
import com.paytrack.common.enums.NotificationType;
import com.paytrack.common.enums.PaymentStatus;
import com.paytrack.common.enums.RelatedEntityType;
import com.paytrack.common.exception.BadRequestException;
import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.integration.googlecalendar.CalendarSyncService;
import com.paytrack.notification.NotificationService;
import com.paytrack.payment.dto.PaymentDto;
import com.paytrack.payment.dto.PaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CalendarSyncService calendarSyncService;
    private final NotificationService notificationService;

    public PageResponse<PaymentDto> search(UUID userId, PaymentStatus status, UUID categoryId,
                                            LocalDate from, LocalDate to, Pageable pageable) {
        Page<Payment> page = paymentRepository.search(userId, status, categoryId, from, to, pageable);
        return PageResponse.from(page.map(this::toDto));
    }

    public PaymentDto getOne(UUID userId, UUID id) {
        return toDto(findOwned(userId, id));
    }

    @Transactional
    public PaymentDto create(UUID userId, PaymentRequest request) {
        Payment payment = Payment.builder()
                .userId(userId)
                .categoryId(request.categoryId())
                .subscriptionId(request.subscriptionId())
                .title(request.title())
                .amount(request.amount())
                .currency(request.currency())
                .dueDate(request.dueDate())
                .recurring(request.recurring())
                .recurrenceRule(request.recurrenceRule())
                .notes(request.notes())
                .build();
        payment = paymentRepository.save(payment);
        syncCalendar(payment);
        return toDto(payment);
    }

    @Transactional
    public PaymentDto update(UUID userId, UUID id, PaymentRequest request) {
        Payment payment = findOwned(userId, id);
        payment.setCategoryId(request.categoryId());
        payment.setSubscriptionId(request.subscriptionId());
        payment.setTitle(request.title());
        payment.setAmount(request.amount());
        payment.setCurrency(request.currency());
        payment.setDueDate(request.dueDate());
        payment.setRecurring(request.recurring());
        payment.setRecurrenceRule(request.recurrenceRule());
        payment.setNotes(request.notes());
        payment = paymentRepository.save(payment);
        syncCalendar(payment);
        return toDto(payment);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Payment payment = findOwned(userId, id);
        calendarSyncService.deleteEvent(userId, RelatedEntityType.PAYMENT, payment.getId());
        paymentRepository.delete(payment);
    }

    @Transactional
    public PaymentDto markPaid(UUID userId, UUID id) {
        Payment payment = findOwned(userId, id);
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Payment is already marked as paid");
        }
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidDate(LocalDate.now());
        payment = paymentRepository.save(payment);
        calendarSyncService.deleteEvent(userId, RelatedEntityType.PAYMENT, payment.getId());
        sendPaymentConfirmation(payment, null);
        return toDto(payment);
    }

    /** Called by the Razorpay webhook handler once a captured payment is reconciled. */
    @Transactional
    public void markPaidFromRazorpay(UUID userId, UUID paymentId, String razorpayPaymentId) {
        paymentRepository.findByIdAndUserId(paymentId, userId).ifPresent(payment -> {
            if (payment.getStatus() != PaymentStatus.PAID) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidDate(LocalDate.now());
                paymentRepository.save(payment);
                calendarSyncService.deleteEvent(userId, RelatedEntityType.PAYMENT, payment.getId());
            }
            sendPaymentConfirmation(payment, razorpayPaymentId);
        });
    }

    private void sendPaymentConfirmation(Payment payment, String razorpayPaymentId) {
        notificationService.notify(
                payment.getUserId(),
                NotificationType.PAYMENT_CONFIRMATION,
                "Payment confirmed: " + payment.getTitle(),
                payment.getCurrency() + " " + payment.getAmount() + " marked as paid",
                RelatedEntityType.PAYMENT,
                payment.getId(),
                NotificationChannel.BOTH,
                "payment-confirmation",
                Map.of("title", payment.getTitle(), "amount", payment.getAmount(), "currency", payment.getCurrency(),
                        "razorpayPaymentId", razorpayPaymentId != null ? razorpayPaymentId : "manual"));
    }

    private void syncCalendar(Payment payment) {
        if (payment.getStatus() == PaymentStatus.PENDING) {
            calendarSyncService.upsertEvent(payment.getUserId(), RelatedEntityType.PAYMENT, payment.getId(),
                    "Payment due: " + payment.getTitle(),
                    payment.getCurrency() + " " + payment.getAmount(), payment.getDueDate());
        }
    }

    private Payment findOwned(UUID userId, UUID id) {
        return paymentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    private PaymentDto toDto(Payment p) {
        return new PaymentDto(p.getId(), p.getCategoryId(), p.getSubscriptionId(), p.getTitle(), p.getAmount(),
                p.getCurrency(), p.getDueDate(), p.getPaidDate(), p.getStatus(), p.isRecurring(),
                p.getRecurrenceRule(), p.getNotes());
    }
}
