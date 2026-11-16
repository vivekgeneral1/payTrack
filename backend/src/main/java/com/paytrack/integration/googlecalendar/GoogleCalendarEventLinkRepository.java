package com.paytrack.integration.googlecalendar;

import com.paytrack.common.enums.RelatedEntityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoogleCalendarEventLinkRepository extends JpaRepository<GoogleCalendarEventLink, UUID> {
    Optional<GoogleCalendarEventLink> findByEntityTypeAndEntityId(RelatedEntityType entityType, UUID entityId);
    void deleteByEntityTypeAndEntityId(RelatedEntityType entityType, UUID entityId);
}
