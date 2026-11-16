package com.paytrack.dashboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CategoryBreakdownDto(UUID categoryId, String categoryName, String color, BigDecimal amount) {
}
