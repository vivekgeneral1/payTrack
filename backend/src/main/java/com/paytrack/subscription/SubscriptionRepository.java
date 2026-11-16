package com.paytrack.subscription;

import com.paytrack.common.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByIdAndUserId(UUID id, UUID userId);

    Page<Subscription> findByUserIdAndStatus(UUID userId, SubscriptionStatus status, Pageable pageable);

    Page<Subscription> findByUserId(UUID userId, Pageable pageable);

    List<Subscription> findAllByUserId(UUID userId);

    @Query("select s from Subscription s where s.status = 'ACTIVE' and s.nextRenewalDate between :from and :to")
    List<Subscription> findActiveRenewingBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select s from Subscription s where s.userId = :userId and s.status = 'ACTIVE' order by s.nextRenewalDate asc")
    List<Subscription> findUpcomingForUser(@Param("userId") UUID userId);

    long countByUserIdAndStatus(UUID userId, SubscriptionStatus status);
}
