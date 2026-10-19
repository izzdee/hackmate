package com.hackmate.dto;

import com.hackmate.enums.TechRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Body of POST /teams and PUT /teams/{id}. Missing lists are treated as empty. */
public record SaveTeamRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 2000) String description,
        @NotNull Long hackathonId,
        List<Long> requiredSkillIds,
        List<TechRole> requiredRoles
) {
}
