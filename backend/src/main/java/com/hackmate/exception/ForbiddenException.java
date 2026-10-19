package com.hackmate.exception;

/** Mapped to HTTP 403 (e.g. not the team leader). */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
