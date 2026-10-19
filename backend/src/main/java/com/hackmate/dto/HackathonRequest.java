package com.hackmate.dto;

import com.hackmate.enums.HackathonMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Body of POST/PUT /hackathons ("Hackathon without id"). Dates use the format yyyy-MM-dd. */
public record HackathonRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @Size(max = 200) String organizer,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        LocalDate registrationDeadline,
        @NotNull @Min(1) @Max(20) Integer maxTeamSize,
        @NotNull HackathonMode mode
) {
}
