package com.paytrack.dashboard.dto;

import java.math.BigDecimal;

public record TimeSeriesPointDto(String label, BigDecimal amount) {
}
