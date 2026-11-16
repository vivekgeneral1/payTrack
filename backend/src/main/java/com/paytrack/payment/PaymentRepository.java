package com.paytrack.payment;

import com.paytrack.common.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            select p from Payment p where p.userId = :userId
            and (:status is null or p.status = :status)
            and (:categoryId is null or p.categoryId = :categoryId)
            and (:from is null or p.dueDate >= :from)
            and (:to is null or p.dueDate <= :to)
            order by p.dueDate asc
            """)
    Page<Payment> search(@Param("userId") UUID userId, @Param("status") PaymentStatus status,
                          @Param("categoryId") UUID categoryId, @Param("from") LocalDate from,
                          @Param("to") LocalDate to, Pageable pageable);

    @Query("select p from Payment p where p.status = 'PENDING' and p.dueDate between :from and :to")
    List<Payment> findPendingDueBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.userId = :userId and p.status = 'PAID' and p.paidDate between :from and :to")
    BigDecimal sumPaidBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    long countByUserIdAndStatus(UUID userId, PaymentStatus status);

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.userId = :userId and p.status = 'PENDING'")
    BigDecimal sumPendingAmount(@Param("userId") UUID userId);

    @Query(value = "select to_char(paid_date, 'YYYY-MM') as ym, sum(amount) from payments " +
            "where user_id = :userId and status = 'PAID' and paid_date >= :from group by ym order by ym", nativeQuery = true)
    List<Object[]> sumPaidGroupedByMonth(@Param("userId") UUID userId, @Param("from") LocalDate from);

    @Query(value = "select category_id, sum(amount) from payments " +
            "where user_id = :userId and status = 'PAID' and paid_date between :from and :to and category_id is not null " +
            "group by category_id", nativeQuery = true)
    List<Object[]> sumPaidGroupedByCategory(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
