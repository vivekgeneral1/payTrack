package com.paytrack.integration.googlecalendar;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.paytrack.common.enums.RelatedEntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Keeps a subscription/payment's due date mirrored onto the user's connected Google Calendar.
 * No-ops silently when the user hasn't connected Google Calendar - sync is opportunistic, never blocking.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarSyncService {

    private final GoogleTokenService googleTokenService;
    private final GoogleCalendarEventLinkRepository linkRepository;

    @Transactional
    public void upsertEvent(UUID userId, RelatedEntityType entityType, UUID entityId, String title, String description, LocalDate date) {
        if (!googleTokenService.isConnected(userId)) {
            return;
        }
        try {
            Calendar calendar = googleTokenService.getAuthorizedClient(userId);
            String calendarId = "primary";

            Event event = new Event().setSummary(title).setDescription(description);
            EventDateTime start = new EventDateTime().setDate(new DateTime(date.toString()));
            event.setStart(start);
            EventDateTime end = new EventDateTime().setDate(new DateTime(date.plusDays(1).toString()));
            event.setEnd(end);

            var existingLink = linkRepository.findByEntityTypeAndEntityId(entityType, entityId);
            Event saved;
            if (existingLink.isPresent()) {
                saved = calendar.events().update(calendarId, existingLink.get().getGoogleEventId(), event).execute();
            } else {
                saved = calendar.events().insert(calendarId, event).execute();
            }

            GoogleCalendarEventLink link = existingLink.orElseGet(() -> GoogleCalendarEventLink.builder()
                    .userId(userId).entityType(entityType).entityId(entityId).calendarId(calendarId).build());
            link.setGoogleEventId(saved.getId());
            link.setLastSyncedAt(java.time.Instant.now());
            linkRepository.save(link);
        } catch (Exception e) {
            log.warn("Google Calendar sync failed for {} {}: {}", entityType, entityId, e.getMessage());
        }
    }

    @Transactional
    public void deleteEvent(UUID userId, RelatedEntityType entityType, UUID entityId) {
        if (!googleTokenService.isConnected(userId)) {
            return;
        }
        linkRepository.findByEntityTypeAndEntityId(entityType, entityId).ifPresent(link -> {
            try {
                Calendar calendar = googleTokenService.getAuthorizedClient(userId);
                calendar.events().delete(link.getCalendarId(), link.getGoogleEventId()).execute();
            } catch (Exception e) {
                log.warn("Google Calendar event deletion failed for {} {}: {}", entityType, entityId, e.getMessage());
            } finally {
                linkRepository.deleteByEntityTypeAndEntityId(entityType, entityId);
            }
        });
    }
}
