package com.hackmate.dto;

import com.hackmate.entity.Team;

/** Small {id, name} reference to a team (used inside TeamRequest). */
public record TeamSummaryDto(Long id, String name) {

    public static TeamSummaryDto from(Team team) {
        return new TeamSummaryDto(team.getId(), team.getName());
    }
}
