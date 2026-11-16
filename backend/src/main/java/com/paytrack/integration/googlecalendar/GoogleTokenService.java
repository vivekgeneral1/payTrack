package com.paytrack.integration.googlecalendar;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.paytrack.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleTokenService {

    private final GoogleOAuthProperties properties;
    private final GoogleCalendarTokenRepository tokenRepository;

    private GoogleAuthorizationCodeFlow buildFlow() {
        try {
            GoogleClientSecrets.Details details = new GoogleClientSecrets.Details()
                    .setClientId(properties.getClientId())
                    .setClientSecret(properties.getClientSecret());
            GoogleClientSecrets secrets = new GoogleClientSecrets().setWeb(details);
            NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
            return new GoogleAuthorizationCodeFlow.Builder(
                    transport, GsonFactory.getDefaultInstance(), secrets, List.of(CalendarScopes.CALENDAR_EVENTS))
                    .setAccessType("offline")
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize Google OAuth flow", e);
        }
    }

    public String buildConsentUrl(UUID userId) {
        return buildFlow().newAuthorizationUrl()
                .setRedirectUri(properties.getRedirectUri())
                .setState(userId.toString())
                .set("prompt", "consent")
                .build();
    }

    @Transactional
    public void handleCallback(UUID userId, String code) {
        try {
            TokenResponse tokenResponse = buildFlow().newTokenRequest(code)
                    .setRedirectUri(properties.getRedirectUri())
                    .execute();
            if (tokenResponse.getRefreshToken() == null) {
                throw new BadRequestException(
                        "Google did not return a refresh token. Disconnect the app at myaccount.google.com and try again.");
            }
            GoogleCalendarToken entity = tokenRepository.findByUserId(userId)
                    .orElse(GoogleCalendarToken.builder().userId(userId).build());
            entity.setAccessToken(tokenResponse.getAccessToken());
            entity.setRefreshToken(tokenResponse.getRefreshToken());
            entity.setScope(tokenResponse.getScope());
            entity.setTokenExpiry(Instant.now().plusSeconds(tokenResponse.getExpiresInSeconds() != null ? tokenResponse.getExpiresInSeconds() : 3600));
            tokenRepository.save(entity);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to connect Google Calendar: " + e.getMessage());
        }
    }

    public boolean isConnected(UUID userId) {
        return tokenRepository.findByUserId(userId).isPresent();
    }

    @Transactional
    public void disconnect(UUID userId) {
        tokenRepository.deleteByUserId(userId);
    }

    /** Returns an authorized Calendar client, refreshing the access token first if it's expired or about to expire. */
    @Transactional
    public Calendar getAuthorizedClient(UUID userId) {
        GoogleCalendarToken entity = tokenRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Google Calendar is not connected"));
        try {
            Credential credential = buildFlow().createAndStoreCredential(
                    new TokenResponse()
                            .setAccessToken(entity.getAccessToken())
                            .setRefreshToken(entity.getRefreshToken())
                            .setExpiresInSeconds(secondsUntil(entity.getTokenExpiry())),
                    userId.toString());

            if (entity.getTokenExpiry().isBefore(Instant.now().plusSeconds(60))) {
                credential.refreshToken();
                entity.setAccessToken(credential.getAccessToken());
                entity.setTokenExpiry(Instant.now().plusSeconds(credential.getExpiresInSeconds() != null ? credential.getExpiresInSeconds() : 3600));
                tokenRepository.save(entity);
            }

            return new Calendar.Builder(GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance(), credential)
                    .setApplicationName("PayTrack")
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to build Google Calendar client", e);
        }
    }

    private Long secondsUntil(Instant expiry) {
        long seconds = Instant.now().until(expiry, java.time.temporal.ChronoUnit.SECONDS);
        return Math.max(seconds, 0);
    }
}
