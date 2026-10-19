package com.hackmate.dto;

import com.hackmate.enums.Availability;
import com.hackmate.enums.ExperienceLevel;
import com.hackmate.enums.TechRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Body of PUT /users/me. Missing lists are treated as empty. */
public record UpdateProfileRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 1000) String bio,
        @NotNull ExperienceLevel experienceLevel,
        List<TechRole> preferredRoles,
        @NotNull Availability availability,
        List<Long> skillIds
) {
}
