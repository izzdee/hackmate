package com.hackmate.dto;

import com.hackmate.entity.Hackathon;
import com.hackmate.enums.HackathonMode;

import java.time.LocalDate;

public record HackathonDto(
        Long id,
        String title,
        String description,
        String organizer,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate registrationDeadline,
        Integer maxTeamSize,
        HackathonMode mode
) {
    public static HackathonDto from(Hackathon h) {
        return new HackathonDto(h.getId(), h.getTitle(), h.getDescription(), h.getOrganizer(),
                h.getStartDate(), h.getEndDate(), h.getRegistrationDeadline(), h.getMaxTeamSize(), h.getMode());
    }
}
