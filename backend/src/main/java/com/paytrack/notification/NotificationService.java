package com.paytrack.notification;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.enums.NotificationChannel;
import com.paytrack.common.enums.NotificationType;
import com.paytrack.common.enums.RelatedEntityType;
import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.integration.email.EmailService;
import com.paytrack.notification.dto.NotificationDto;
import com.paytrack.user.User;
import com.paytrack.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PageResponse<NotificationDto> list(UUID userId, Pageable pageable) {
        return PageResponse.from(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toDto));
    }

    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notification.setReadAt(java.time.Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId);
    }

    /** Creates the in-app notification row and, for EMAIL/BOTH channels, best-effort sends the paired email. */
    @Transactional
    public void notify(UUID userId, NotificationType type, String title, String body,
                        RelatedEntityType relatedEntityType, UUID relatedEntityId,
                        NotificationChannel channel, String emailTemplate, Map<String, Object> emailVars) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .channel(channel)
                .build();
        notificationRepository.save(notification);

        if (channel == NotificationChannel.EMAIL || channel == NotificationChannel.BOTH) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && emailTemplate != null) {
                emailService.send(user.getEmail(), title, emailTemplate, emailVars);
            }
        }
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getType(), n.getTitle(), n.getBody(),
                n.getRelatedEntityType(), n.getRelatedEntityId(), n.isRead(), n.getCreatedAt());
    }
}
