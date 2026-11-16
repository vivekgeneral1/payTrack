package com.paytrack.auth.dto;

import java.util.UUID;

public record AuthResponse(String accessToken, String refreshToken, UUID userId, String email, String fullName) {
}
