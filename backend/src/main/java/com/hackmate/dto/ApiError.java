package com.hackmate.dto;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/** The single error shape returned for every 4xx/5xx: {status, message, timestamp}. */
public record ApiError(int status, String message, LocalDateTime timestamp) {

    public static ApiError of(int status, String message) {
        return new ApiError(status, message, LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
    }
}
