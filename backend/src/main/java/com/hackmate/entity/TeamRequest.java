package com.hackmate.entity;

import com.hackmate.enums.RequestStatus;
import com.hackmate.enums.RequestType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * An invite or a join request between a team and a user.
 * {@code user} is always the non-leader side: the invited user (INVITE)
 * or the user asking to join (JOIN_REQUEST).
 */
@Entity
@Table(name = "team_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
