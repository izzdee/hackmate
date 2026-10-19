package com.hackmate.exception;

/** Mapped to HTTP 409 (duplicate: email taken, request pending, already in a team). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
