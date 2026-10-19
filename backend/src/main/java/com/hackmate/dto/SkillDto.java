package com.hackmate.dto;

import com.hackmate.entity.Skill;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

public record SkillDto(Long id, String name) {

    public static SkillDto from(Skill skill) {
        return new SkillDto(skill.getId(), skill.getName());
    }

    /** Converts a set of skills into a list sorted by name (stable output for the UI). */
    public static List<SkillDto> fromAll(Collection<Skill> skills) {
        return skills.stream()
                .sorted(Comparator.comparing(Skill::getName, String.CASE_INSENSITIVE_ORDER))
                .map(SkillDto::from)
                .toList();
    }
}
