package com.hackmate.dto;

import com.hackmate.entity.Team;
import com.hackmate.entity.User;
import com.hackmate.enums.TechRole;

import java.util.Comparator;
import java.util.List;

public record TeamDto(
        Long id,
        String name,
        String description,
        HackathonSummaryDto hackathon,
        UserSummaryDto leader,
        List<UserDto> members,
        List<SkillDto> requiredSkills,
        List<TechRole> requiredRoles,
        Integer maxTeamSize
) {
    public static TeamDto from(Team team) {
        Long leaderId = team.getLeader().getId();
        // Leader first, then the other members alphabetically.
        List<UserDto> members = team.getMembers().stream()
                .sorted(Comparator.comparing((User u) -> !u.getId().equals(leaderId))
                        .thenComparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .map(UserDto::from)
                .toList();

        return new TeamDto(
                team.getId(),
                team.getName(),
                team.getDescription(),
                HackathonSummaryDto.from(team.getHackathon()),
                UserSummaryDto.from(team.getLeader()),
                members,
                SkillDto.fromAll(team.getRequiredSkills()),
                team.getRequiredRoles().stream().sorted().toList(),
                team.getHackathon().getMaxTeamSize()
        );
    }
}
