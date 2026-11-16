package com.paytrack.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 255) String fullName,
        @Size(max = 3) String defaultCurrency,
        @Size(max = 64) String timezone
) {
}
