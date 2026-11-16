package com.paytrack.category.dto;

import java.util.UUID;

public record CategoryDto(UUID id, String name, String icon, String color, boolean isSystem) {
}
