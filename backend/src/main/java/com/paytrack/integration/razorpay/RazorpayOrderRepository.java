package com.paytrack.integration.razorpay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RazorpayOrderRepository extends JpaRepository<RazorpayOrder, UUID> {
    Optional<RazorpayOrder> findByRazorpayOrderId(String razorpayOrderId);
    Optional<RazorpayOrder> findByIdAndUserId(UUID id, UUID userId);
}
