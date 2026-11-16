package com.paytrack.integration.razorpay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RazorpayWebhookEventRepository extends JpaRepository<RazorpayWebhookEvent, UUID> {
    boolean existsByRazorpayEventId(String razorpayEventId);
}
