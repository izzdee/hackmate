package com.hackmate.dto;

/** Response of POST /auth/login: {token, user}. */
public record AuthResponse(String token, UserDto user) {
}
