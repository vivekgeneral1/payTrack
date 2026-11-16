package com.paytrack.notification;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.notification.dto.NotificationDto;
import com.paytrack.security.CurrentUserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationDto> list(@CurrentUserId UUID userId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(userId, PageRequest.of(page, size));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@CurrentUserId UUID userId) {
        return Map.of("count", notificationService.unreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@CurrentUserId UUID userId, @PathVariable UUID id) {
        notificationService.markRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@CurrentUserId UUID userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }
}
