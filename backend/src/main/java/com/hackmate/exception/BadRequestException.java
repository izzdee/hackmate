package com.hackmate.exception;

/** Mapped to HTTP 400 (validation / business-rule violation). */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
