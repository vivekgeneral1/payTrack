package com.paytrack.integration.googlecalendar;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "google_calendar_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleCalendarToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    /** Stored encrypted via {@link TokenCryptoConverter}. */
    @Convert(converter = TokenCryptoConverter.class)
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    @Convert(converter = TokenCryptoConverter.class)
    @Column(name = "refresh_token", nullable = false, columnDefinition = "TEXT")
    private String refreshToken;

    private String scope;

    @Column(name = "token_expiry", nullable = false)
    private Instant tokenExpiry;

    @Column(name = "calendar_id", nullable = false)
    @Builder.Default
    private String calendarId = "primary";

    @CreationTimestamp
    @Column(name = "connected_at", updatable = false)
    private Instant connectedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
