package com.paytrack.subscription;

import com.paytrack.common.enums.BillingCycle;
import com.paytrack.common.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "plan_name")
    private String planName;

    @Column(nullable = false)
    private BigDecimal cost;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    @Builder.Default
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(name = "custom_interval_days")
    private Integer customIntervalDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_renewal_date", nullable = false)
    private LocalDate nextRenewalDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "auto_renew", nullable = false)
    @Builder.Default
    private boolean autoRenew = true;

    @Column(name = "cancellation_url")
    private String cancellationUrl;

    @Column(name = "cancellation_instructions", columnDefinition = "TEXT")
    private String cancellationInstructions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public LocalDate computeNextRenewalAfter(LocalDate from) {
        return switch (billingCycle) {
            case WEEKLY -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case QUARTERLY -> from.plusMonths(3);
            case YEARLY -> from.plusYears(1);
            case CUSTOM -> from.plusDays(customIntervalDays != null ? customIntervalDays : 30);
        };
    }
}
