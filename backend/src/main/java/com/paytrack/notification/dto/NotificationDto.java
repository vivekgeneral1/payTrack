package com.paytrack.notification.dto;

import com.paytrack.common.enums.NotificationType;
import com.paytrack.common.enums.RelatedEntityType;

import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        NotificationType type,
        String title,
        String body,
        RelatedEntityType relatedEntityType,
        UUID relatedEntityId,
        boolean read,
        Instant createdAt
) {
}
