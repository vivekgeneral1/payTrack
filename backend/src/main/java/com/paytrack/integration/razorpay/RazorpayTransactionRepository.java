package com.paytrack.integration.razorpay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RazorpayTransactionRepository extends JpaRepository<RazorpayTransaction, UUID> {
    boolean existsByRazorpayPaymentId(String razorpayPaymentId);
}
