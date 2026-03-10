package com.pharmalovo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private final String message;
    private final UUID userId;
    private final String name;
    private final String role;
    private final String token;
    private final String redirectPath;
}
