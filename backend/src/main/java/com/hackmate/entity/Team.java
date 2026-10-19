package com.hackmate.entity;

import com.hackmate.enums.TechRole;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hackathon_id")
    private Hackathon hackathon;

    @ManyToOne(optional = false)
    @JoinColumn(name = "leader_id")
    private User leader;

    /** All members, including the leader. */
    @ManyToMany
    @JoinTable(name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "team_required_skills",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    @Builder.Default
    private Set<Skill> requiredSkills = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "team_required_roles", joinColumns = @JoinColumn(name = "team_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "required_role")
    @Builder.Default
    private Set<TechRole> requiredRoles = new HashSet<>();
}
