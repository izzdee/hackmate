package com.hackmate.dto;

import com.hackmate.entity.User;
import com.hackmate.enums.Availability;
import com.hackmate.enums.ExperienceLevel;
import com.hackmate.enums.Role;
import com.hackmate.enums.TechRole;

import java.util.List;

/** Public view of a user. Deliberately has no password field. */
public record UserDto(
        Long id,
        String name,
        String email,
        String bio,
        Role role,
        ExperienceLevel experienceLevel,
        List<TechRole> preferredRoles,
        Availability availability,
        List<SkillDto> skills
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getRole(),
                user.getExperienceLevel(),
                user.getPreferredRoles().stream().sorted().toList(),
                user.getAvailability(),
                SkillDto.fromAll(user.getSkills())
        );
    }
}
