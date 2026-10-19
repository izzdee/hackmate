package com.hackmate.dto;

import com.hackmate.entity.Hackathon;

/** Small {id, title} reference to a hackathon (used inside Team). */
public record HackathonSummaryDto(Long id, String title) {

    public static HackathonSummaryDto from(Hackathon hackathon) {
        return new HackathonSummaryDto(hackathon.getId(), hackathon.getTitle());
    }
}
