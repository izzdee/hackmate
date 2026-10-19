package com.hackmate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hackmate.entity.Notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String message,
        // Without this Jackson would name a boolean "isRead" accessor "read".
        @JsonProperty("isRead") boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(notification.getId(), notification.getMessage(),
                notification.isRead(), notification.getCreatedAt());
    }
}
