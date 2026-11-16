package com.paytrack.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubscriptionCancellationRepository extends JpaRepository<SubscriptionCancellation, UUID> {
    List<SubscriptionCancellation> findBySubscriptionIdOrderByCancelledAtDesc(UUID subscriptionId);
}
