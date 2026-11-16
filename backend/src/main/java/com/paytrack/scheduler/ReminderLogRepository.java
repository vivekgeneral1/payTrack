package com.paytrack.scheduler;

import com.paytrack.common.enums.RelatedEntityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, UUID> {
    boolean existsByEntityTypeAndEntityIdAndOffsetDays(RelatedEntityType entityType, UUID entityId, int offsetDays);
}
