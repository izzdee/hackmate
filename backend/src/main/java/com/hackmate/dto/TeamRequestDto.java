package com.hackmate.dto;

import com.hackmate.entity.TeamRequest;
import com.hackmate.enums.RequestStatus;
import com.hackmate.enums.RequestType;

import java.time.LocalDateTime;

public record TeamRequestDto(
        Long id,
        RequestType type,
        RequestStatus status,
        LocalDateTime createdAt,
        TeamSummaryDto team,
        UserSummaryDto user
) {
    public static TeamRequestDto from(TeamRequest request) {
        return new TeamRequestDto(
                request.getId(),
                request.getType(),
                request.getStatus(),
                request.getCreatedAt(),
                TeamSummaryDto.from(request.getTeam()),
                UserSummaryDto.from(request.getUser())
        );
    }
}
