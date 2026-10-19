package com.hackmate.service;

import com.hackmate.dto.MatchResultDto;
import com.hackmate.dto.SkillDto;
import com.hackmate.dto.UserDto;
import com.hackmate.entity.Skill;
import com.hackmate.entity.Team;
import com.hackmate.entity.User;
import com.hackmate.enums.Availability;
import com.hackmate.enums.ExperienceLevel;
import com.hackmate.enums.Role;
import com.hackmate.enums.TechRole;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.TeamRepository;
import com.hackmate.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Rule-based, deterministic teammate matching (no AI/ML).
 *
 * score = skill (max 50) + role (max 25) + experience (max 15) + availability (max 10)
 */
@Service
@Transactional(readOnly = true)
public class MatchingService {

    public static final double SKILL_WEIGHT = 50;
    public static final double ROLE_WEIGHT = 25;
    public static final double EXPERIENCE_WEIGHT = 15;
    public static final double AVAILABILITY_WEIGHT = 10;

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public MatchingService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    /** GET /teams/{id}/skill-gap: the required skills no current member has. */
    public List<SkillDto> getSkillGap(Long teamId) {
        return SkillDto.fromAll(findMissingSkills(findTeam(teamId)));
    }

    /** GET /teams/{id}/matches: eligible students ranked by score (desc), then name (asc). */
    public List<MatchResultDto> getMatches(Long teamId) {
        Team team = findTeam(teamId);
        Set<Skill> missingSkills = findMissingSkills(team);
        Set<TechRole> uncoveredRoles = findUncoveredRoles(team);

        // Step 3: candidates = students who are not in ANY team of this hackathon
        // (this also excludes the members of this team).
        Set<Long> usersAlreadyInATeam = teamRepository.findByHackathonIdOrderByNameAsc(team.getHackathon().getId())
                .stream()
                .flatMap(t -> t.getMembers().stream())
                .map(User::getId)
                .collect(Collectors.toSet());

        return userRepository.findByRoleOrderByNameAsc(Role.STUDENT).stream()
                .filter(candidate -> !usersAlreadyInATeam.contains(candidate.getId()))
                .map(candidate -> score(candidate, missingSkills, uncoveredRoles))
                .sorted(Comparator.comparingDouble(MatchResultDto::score).reversed()
                        .thenComparing(result -> result.user().name(), String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    /** Step 1: missingSkills = team.requiredSkills − (union of all members' skills). */
    Set<Skill> findMissingSkills(Team team) {
        Set<Long> memberSkillIds = team.getMembers().stream()
                .flatMap(member -> member.getSkills().stream())
                .map(Skill::getId)
                .collect(Collectors.toSet());

        return team.getRequiredSkills().stream()
                .filter(skill -> !memberSkillIds.contains(skill.getId()))
                .collect(Collectors.toSet());
    }

    /** Step 2: uncoveredRoles = team.requiredRoles − (union of all members' preferredRoles). */
    Set<TechRole> findUncoveredRoles(Team team) {
        Set<TechRole> uncovered = new HashSet<>(team.getRequiredRoles());
        team.getMembers().forEach(member -> uncovered.removeAll(member.getPreferredRoles()));
        return uncovered;
    }

    /** Step 4: score one candidate. */
    MatchResultDto score(User candidate, Set<Skill> missingSkills, Set<TechRole> uncoveredRoles) {
        // Skill: share of the missing skills this candidate brings (0 if nothing is missing).
        double skill = 0;
        if (!missingSkills.isEmpty()) {
            Set<Long> candidateSkillIds = candidate.getSkills().stream().map(Skill::getId).collect(Collectors.toSet());
            long matched = missingSkills.stream().filter(s -> candidateSkillIds.contains(s.getId())).count();
            skill = (double) matched / missingSkills.size() * SKILL_WEIGHT;
        }

        // Role: full points if the candidate prefers at least one uncovered role.
        boolean coversARole = candidate.getPreferredRoles().stream().anyMatch(uncoveredRoles::contains);
        double role = coversARole ? ROLE_WEIGHT : 0;

        double experience = experiencePoints(candidate.getExperienceLevel());
        double availability = availabilityPoints(candidate.getAvailability());

        double total = round1(skill) + role + experience + availability;
        return new MatchResultDto(
                UserDto.from(candidate),
                round1(total),
                new MatchResultDto.Breakdown(round1(skill), role, experience, availability)
        );
    }

    static double experiencePoints(ExperienceLevel level) {
        if (level == null) {
            return 0;
        }
        return switch (level) {
            case ADVANCED -> EXPERIENCE_WEIGHT;  // 15
            case INTERMEDIATE -> 10;
            case BEGINNER -> 5;
        };
    }

    static double availabilityPoints(Availability availability) {
        if (availability == null) {
            return 0;
        }
        return switch (availability) {
            case FULL_TIME -> AVAILABILITY_WEIGHT;  // 10
            case PART_TIME -> 6;
            case WEEKENDS -> 3;
        };
    }

    /** Round to 1 decimal place, e.g. 16.666 → 16.7. */
    static double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }

    private Team findTeam(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
    }
}
