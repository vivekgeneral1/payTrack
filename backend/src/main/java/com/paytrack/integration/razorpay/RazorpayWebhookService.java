package com.paytrack.integration.razorpay;

import com.paytrack.payment.PaymentService;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookService {

    private final RazorpayOrderRepository razorpayOrderRepository;
    private final RazorpayWebhookEventRepository webhookEventRepository;
    private final RazorpayTransactionRepository transactionRepository;
    private final PaymentService paymentService;

    @Value("${paytrack.razorpay.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public boolean processWebhook(String payload, String signature) {
        try {
            if (signature == null || !Utils.verifyWebhookSignature(payload, signature, webhookSecret)) {
                log.warn("Rejected Razorpay webhook: invalid signature");
                return false;
            }
        } catch (Exception e) {
            log.warn("Razorpay webhook signature verification error: {}", e.getMessage());
            return false;
        }

        JSONObject json = new JSONObject(payload);
        String eventType = json.optString("event", "unknown");
        String eventId = resolveEventId(json, payload);

        if (webhookEventRepository.existsByRazorpayEventId(eventId)) {
            log.info("Duplicate Razorpay webhook event {} ignored", eventId);
            return true;
        }

        RazorpayWebhookEvent eventRecord = RazorpayWebhookEvent.builder()
                .razorpayEventId(eventId)
                .eventType(eventType)
                .rawPayload(payload)
                .build();
        webhookEventRepository.save(eventRecord);

        try {
            handleEvent(eventType, json);
            eventRecord.setProcessedAt(java.time.Instant.now());
            webhookEventRepository.save(eventRecord);
        } catch (Exception e) {
            log.error("Failed to process Razorpay webhook event {} ({}): {}", eventId, eventType, e.getMessage());
        }
        return true;
    }

    private void handleEvent(String eventType, JSONObject json) {
        if (!json.has("payload") || !json.getJSONObject("payload").has("payment")) {
            return;
        }
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentEntity.optString("order_id", null);
        String razorpayPaymentId = paymentEntity.optString("id", null);
        if (razorpayOrderId == null || razorpayPaymentId == null) {
            return;
        }

        RazorpayOrder order = razorpayOrderRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
        if (order == null) {
            log.warn("Razorpay webhook referenced unknown order {}", razorpayOrderId);
            return;
        }

        if (transactionRepository.existsByRazorpayPaymentId(razorpayPaymentId)) {
            return;
        }

        BigDecimal amount = BigDecimal.valueOf(paymentEntity.optLong("amount", 0)).divide(BigDecimal.valueOf(100));
        String status = paymentEntity.optString("status", "unknown");

        RazorpayTransaction transaction = RazorpayTransaction.builder()
                .razorpayOrderId(order.getId())
                .razorpayPaymentId(razorpayPaymentId)
                .status(status)
                .method(paymentEntity.optString("method", null))
                .amount(amount)
                .currency(paymentEntity.optString("currency", order.getCurrency()))
                .rawPayload(paymentEntity.toString())
                .build();
        transactionRepository.save(transaction);

        boolean captured = "payment.captured".equals(eventType) || "captured".equals(status);
        boolean failed = "payment.failed".equals(eventType) || "failed".equals(status);

        order.setStatus(captured ? RazorpayOrderStatus.PAID : (failed ? RazorpayOrderStatus.FAILED : RazorpayOrderStatus.ATTEMPTED));
        razorpayOrderRepository.save(order);

        if (captured && order.getPaymentId() != null) {
            paymentService.markPaidFromRazorpay(order.getUserId(), order.getPaymentId(), razorpayPaymentId);
        }
    }

    private String resolveEventId(JSONObject json, String payload) {
        if (json.has("id") && !json.isNull("id")) {
            return json.getString("id");
        }
        return sha256(payload);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(digest.digest(input.getBytes()));
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}
