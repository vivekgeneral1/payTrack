package com.paytrack.dashboard;

import com.paytrack.category.Category;
import com.paytrack.category.CategoryRepository;
import com.paytrack.common.enums.PaymentStatus;
import com.paytrack.common.enums.SubscriptionStatus;
import com.paytrack.dashboard.dto.CategoryBreakdownDto;
import com.paytrack.dashboard.dto.DashboardSummaryDto;
import com.paytrack.dashboard.dto.TimeSeriesPointDto;
import com.paytrack.dashboard.dto.UpcomingRenewalDto;
import com.paytrack.payment.PaymentRepository;
import com.paytrack.subscription.Subscription;
import com.paytrack.subscription.SubscriptionCancellation;
import com.paytrack.subscription.SubscriptionCancellationRepository;
import com.paytrack.subscription.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionCancellationRepository cancellationRepository;
    private final CategoryRepository categoryRepository;

    public DashboardSummaryDto summary(UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

        BigDecimal totalSpendThisMonth = paymentRepository.sumPaidBetween(userId, monthStart, monthEnd);
        long activeSubs = subscriptionRepository.countByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE);
        long cancelledSubs = subscriptionRepository.countByUserIdAndStatus(userId, SubscriptionStatus.CANCELLED);
        BigDecimal estimatedMonthlyCost = subscriptionRepository.findAllByUserId(userId).stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .map(this::monthlyEquivalentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long upcomingRenewals = subscriptionRepository.findUpcomingForUser(userId).stream()
                .filter(s -> !s.getNextRenewalDate().isAfter(now.plusDays(30)))
                .count();
        long pendingCount = paymentRepository.countByUserIdAndStatus(userId, PaymentStatus.PENDING);
        BigDecimal pendingAmount = paymentRepository.sumPendingAmount(userId);

        return new DashboardSummaryDto(totalSpendThisMonth, activeSubs, estimatedMonthlyCost, upcomingRenewals,
                pendingCount, pendingAmount, cancelledSubs);
    }

    public List<TimeSeriesPointDto> spendingOverTime(UUID userId, int months) {
        LocalDate from = LocalDate.now().minusMonths(months - 1L).withDayOfMonth(1);
        Map<String, BigDecimal> byMonth = new LinkedHashMap<>();
        for (int i = 0; i < months; i++) {
            byMonth.put(YearMonth.from(from.plusMonths(i)).format(MONTH_FMT), BigDecimal.ZERO);
        }
        for (Object[] row : paymentRepository.sumPaidGroupedByMonth(userId, from)) {
            byMonth.put(String.valueOf(row[0]), toBigDecimal(row[1]));
        }
        return byMonth.entrySet().stream().map(e -> new TimeSeriesPointDto(e.getKey(), e.getValue())).toList();
    }

    public List<CategoryBreakdownDto> categoryBreakdown(UUID userId, LocalDate from, LocalDate to) {
        LocalDate effectiveFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveTo = to != null ? to : effectiveFrom.plusMonths(1).minusDays(1);
        Map<UUID, Category> categories = categoryRepository.findAllVisibleToUser(userId).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        List<CategoryBreakdownDto> result = new ArrayList<>();
        for (Object[] row : paymentRepository.sumPaidGroupedByCategory(userId, effectiveFrom, effectiveTo)) {
            UUID categoryId = (UUID) row[0];
            BigDecimal amount = toBigDecimal(row[1]);
            Category category = categories.get(categoryId);
            result.add(new CategoryBreakdownDto(categoryId, category != null ? category.getName() : "Uncategorized",
                    category != null ? category.getColor() : "#6b7280", amount));
        }
        return result;
    }

    public List<TimeSeriesPointDto> subscriptionCostTrend(UUID userId, int months) {
        List<Subscription> subscriptions = subscriptionRepository.findAllByUserId(userId);
        Map<UUID, LocalDate> latestCancellationEffectiveDate = new HashMap<>();
        for (Subscription s : subscriptions) {
            if (s.getStatus() == SubscriptionStatus.CANCELLED) {
                List<SubscriptionCancellation> history = cancellationRepository.findBySubscriptionIdOrderByCancelledAtDesc(s.getId());
                if (!history.isEmpty() && history.get(0).getEffectiveDate() != null) {
                    latestCancellationEffectiveDate.put(s.getId(), history.get(0).getEffectiveDate());
                }
            }
        }

        List<TimeSeriesPointDto> points = new ArrayList<>();
        YearMonth start = YearMonth.now().minusMonths(months - 1L);
        for (int i = 0; i < months; i++) {
            YearMonth ym = start.plusMonths(i);
            LocalDate monthEnd = ym.atEndOfMonth();
            BigDecimal total = BigDecimal.ZERO;
            for (Subscription s : subscriptions) {
                if (s.getStartDate().isAfter(monthEnd)) continue;
                LocalDate cancelledEffective = latestCancellationEffectiveDate.get(s.getId());
                boolean activeDuringMonth = cancelledEffective == null || cancelledEffective.isAfter(monthEnd);
                if (activeDuringMonth) {
                    total = total.add(monthlyEquivalentCost(s));
                }
            }
            points.add(new TimeSeriesPointDto(ym.format(MONTH_FMT), total));
        }
        return points;
    }

    public List<UpcomingRenewalDto> upcomingRenewals(UUID userId) {
        LocalDate now = LocalDate.now();
        return subscriptionRepository.findUpcomingForUser(userId).stream()
                .map(s -> new UpcomingRenewalDto(s.getId(), s.getProviderName(), s.getCost(), s.getCurrency(),
                        s.getNextRenewalDate(), ChronoUnit.DAYS.between(now, s.getNextRenewalDate())))
                .toList();
    }

    private BigDecimal monthlyEquivalentCost(Subscription s) {
        BigDecimal cost = s.getCost();
        return switch (s.getBillingCycle()) {
            case WEEKLY -> cost.multiply(BigDecimal.valueOf(52)).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            case MONTHLY -> cost;
            case QUARTERLY -> cost.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            case YEARLY -> cost.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            case CUSTOM -> {
                int days = s.getCustomIntervalDays() != null ? s.getCustomIntervalDays() : 30;
                yield cost.multiply(BigDecimal.valueOf(30)).divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
            }
        };
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
