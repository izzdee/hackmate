package com.hackmate.dto;

/** Response of GET /notifications/unread-count: {"count": 3}. */
public record CountResponse(long count) {
}
