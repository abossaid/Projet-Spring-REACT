package com.library.dls.dto;

import com.library.dls.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Admin update of a user. Password is optional: leave it blank/null to keep
 * the existing password unchanged.
 */
public record UserUpdateRequest(
        @Email(message = "Email must be valid")
        String email,

        @NotNull(message = "Role is required")
        Role role,

        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        String password
) {
}
