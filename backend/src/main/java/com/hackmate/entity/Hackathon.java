package com.hackmate.entity;

import com.hackmate.enums.HackathonMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "hackathons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hackathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String organizer;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate registrationDeadline;

    @Column(nullable = false)
    private Integer maxTeamSize;

    @Enumerated(EnumType.STRING)
    private HackathonMode mode;
}
