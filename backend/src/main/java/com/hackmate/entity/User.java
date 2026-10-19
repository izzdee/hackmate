package com.hackmate.entity;

import com.hackmate.enums.Availability;
import com.hackmate.enums.ExperienceLevel;
import com.hackmate.enums.Role;
import com.hackmate.enums.TechRole;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

// "user" is a reserved word in PostgreSQL, so the table is called "users".
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt hash - never exposed through the API. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    @ElementCollection
    @CollectionTable(name = "user_preferred_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_role")
    @Builder.Default
    private Set<TechRole> preferredRoles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private Availability availability;

    @Column(length = 1000)
    private String bio;

    @ManyToMany
    @JoinTable(name = "user_skills",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();
}
