package com.paytrack.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByIdAndUserId(UUID id, UUID userId);

    // `search` must be a non-null string ("" to mean "no filter") - binding a literal null into the
    // concat()/lower() expressions below makes PostgreSQL infer the parameter as bytea and the query
    // fails with "function lower(bytea) does not exist". The service layer defaults it to "".
    @Query("""
            select i from Invoice i where i.userId = :userId
            and (:paymentId is null or i.paymentId = :paymentId)
            and (:subscriptionId is null or i.subscriptionId = :subscriptionId)
            and (lower(i.originalFilename) like lower(concat('%', :search, '%'))
                 or lower(coalesce(i.vendorName, '')) like lower(concat('%', :search, '%')))
            order by i.uploadedAt desc
            """)
    Page<Invoice> search(@Param("userId") UUID userId, @Param("paymentId") UUID paymentId,
                          @Param("subscriptionId") UUID subscriptionId, @Param("search") String search,
                          Pageable pageable);
}
