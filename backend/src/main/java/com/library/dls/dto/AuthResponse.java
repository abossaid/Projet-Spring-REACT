package com.library.dls.dto;

public record AuthResponse(
        String token,
        Long id,
        String username,
        String email,
        String role
) {
}
