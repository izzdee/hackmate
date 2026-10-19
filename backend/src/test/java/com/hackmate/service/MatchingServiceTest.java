package com.hackmate.service;

import com.hackmate.dto.MatchResultDto;
import com.hackmate.dto.SkillDto;
import com.hackmate.entity.Hackathon;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/** Unit tests for the rule-based matching algorithm (no database, repositories are mocked). */
@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;

    private MatchingService matchingService;

    private final Skill java = new Skill(1L, "Java");
    private final Skill react = new Skill(2L, "React");
    private final Skill figma = new Skill(3L, "Figma");
    private final Skill python = new Skill(4L, "Python");

    private final Hackathon hackathon = Hackathon.builder().id(1L).title("SIH").maxTeamSize(4).build();

    private long nextUserId = 100;

    @BeforeEach
    void setUp() {
        matchingService = new MatchingService(teamRepository, userRepository);
    }

    // ---------- step 1 & 2: skill gap and uncovered roles ----------

    @Test
    void skillGap_isRequiredSkillsMinusMembersSkills() {
        User leader = student("Leader", Set.of(java), Set.of(TechRole.BACKEND), ExperienceLevel.ADVANCED, Availability.FULL_TIME);
        Team team = team(10L, leader, Set.of(java, react, figma), Set.of());
        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

        List<SkillDto> gap = matchingService.getSkillGap(10L);

        assertThat(gap).extracting(SkillDto::name).containsExactly("Figma", "React");
    }

    @Test
    void skillGap_isEmptyWhenMembersCoverAllSkills() {
        User leader = student("Leader", Set.of(java, react), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);
        Team team = team(10L, leader, Set.of(java, react), Set.of());
        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

        assertThat(matchingService.getSkillGap(10L)).isEmpty();
    }

    @Test
    void uncoveredRoles_excludeRolesMembersAlreadyPrefer() {
        User leader = student("Leader", Set.of(), Set.of(TechRole.BACKEND), ExperienceLevel.BEGINNER, Availability.WEEKENDS);
        Team team = team(10L, leader, Set.of(), Set.of(TechRole.BACKEND, TechRole.FRONTEND));

        assertThat(matchingService.findUncoveredRoles(team)).containsExactly(TechRole.FRONTEND);
    }

    @Test
    void skillGap_unknownTeamThrowsNotFound() {
        when(teamRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> matchingService.getSkillGap(99L)).isInstanceOf(ResourceNotFoundException.class);
    }

    // ---------- step 4: scoring rules ----------

    @Test
    void skillScore_isProportionalToMissingSkillsCovered() {
        User candidate = student("C", Set.of(react, python), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);

        // Candidate has 1 of the 2 missing skills (React yes, Figma no) → 1/2 × 50 = 25
        MatchResultDto result = matchingService.score(candidate, Set.of(react, figma), Set.of());

        assertThat(result.breakdown().skill()).isEqualTo(25.0);
    }

    @Test
    void skillScore_isZeroWhenNoSkillsAreMissing() {
        User candidate = student("C", Set.of(java, react), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);

        MatchResultDto result = matchingService.score(candidate, Set.of(), Set.of());

        assertThat(result.breakdown().skill()).isZero();
    }

    @Test
    void skillScore_isRoundedToOneDecimal() {
        User candidate = student("C", Set.of(java), Set.of(), null, null);

        // 1/3 × 50 = 16.666... → 16.7
        MatchResultDto result = matchingService.score(candidate, Set.of(java, react, figma), Set.of());

        assertThat(result.breakdown().skill()).isEqualTo(16.7);
        assertThat(result.score()).isEqualTo(16.7);
    }

    @Test
    void roleScore_is25WhenCandidateCoversAnUncoveredRole() {
        User covers = student("A", Set.of(), Set.of(TechRole.FRONTEND, TechRole.ML), null, null);
        User doesNot = student("B", Set.of(), Set.of(TechRole.BACKEND), null, null);
        Set<TechRole> uncovered = Set.of(TechRole.FRONTEND, TechRole.UI_UX);

        assertThat(matchingService.score(covers, Set.of(), uncovered).breakdown().role()).isEqualTo(25.0);
        assertThat(matchingService.score(doesNot, Set.of(), uncovered).breakdown().role()).isZero();
    }

    @Test
    void experiencePoints_followTheTable() {
        assertThat(MatchingService.experiencePoints(ExperienceLevel.ADVANCED)).isEqualTo(15.0);
        assertThat(MatchingService.experiencePoints(ExperienceLevel.INTERMEDIATE)).isEqualTo(10.0);
        assertThat(MatchingService.experiencePoints(ExperienceLevel.BEGINNER)).isEqualTo(5.0);
    }

    @Test
    void availabilityPoints_followTheTable() {
        assertThat(MatchingService.availabilityPoints(Availability.FULL_TIME)).isEqualTo(10.0);
        assertThat(MatchingService.availabilityPoints(Availability.PART_TIME)).isEqualTo(6.0);
        assertThat(MatchingService.availabilityPoints(Availability.WEEKENDS)).isEqualTo(3.0);
    }

    @Test
    void totalScore_isSumOfBreakdown() {
        User candidate = student("C", Set.of(react, figma), Set.of(TechRole.UI_UX),
                ExperienceLevel.INTERMEDIATE, Availability.FULL_TIME);

        // skill 2/2 × 50 = 50, role 25, experience 10, availability 10 → 95
        MatchResultDto result = matchingService.score(candidate, Set.of(react, figma), Set.of(TechRole.UI_UX));

        assertThat(result.breakdown()).isEqualTo(new MatchResultDto.Breakdown(50, 25, 10, 10));
        assertThat(result.score()).isEqualTo(95.0);
    }

    @Test
    void contractExample_scores82point5() {
        // Example from API_CONTRACT.md: skill 37.5 + role 25 + experience 10 + availability 10 = 82.5
        Skill docker = new Skill(5L, "Docker");
        User candidate = student("C", Set.of(react, figma, python), Set.of(TechRole.FRONTEND),
                ExperienceLevel.INTERMEDIATE, Availability.FULL_TIME);

        MatchResultDto result = matchingService.score(candidate, Set.of(react, figma, python, docker), Set.of(TechRole.FRONTEND));

        assertThat(result.breakdown().skill()).isEqualTo(37.5);
        assertThat(result.score()).isEqualTo(82.5);
    }

    // ---------- step 3 & 5: candidate filtering and sorting ----------

    @Test
    void matches_excludeMembersOfThisTeamAndOfOtherTeamsInSameHackathon() {
        User leader = student("Leader", Set.of(java), Set.of(TechRole.BACKEND), ExperienceLevel.ADVANCED, Availability.FULL_TIME);
        User member = student("Member", Set.of(), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);
        User otherTeamLeader = student("Other", Set.of(react), Set.of(), ExperienceLevel.ADVANCED, Availability.FULL_TIME);
        User free = student("Free", Set.of(react), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);

        Team team = team(10L, leader, Set.of(java, react), Set.of());
        team.getMembers().add(member);
        Team otherTeam = team(11L, otherTeamLeader, Set.of(), Set.of());

        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
        when(teamRepository.findByHackathonIdOrderByNameAsc(1L)).thenReturn(List.of(team, otherTeam));
        when(userRepository.findByRoleOrderByNameAsc(Role.STUDENT))
                .thenReturn(List.of(free, leader, member, otherTeamLeader));

        List<MatchResultDto> matches = matchingService.getMatches(10L);

        assertThat(matches).extracting(m -> m.user().name()).containsExactly("Free");
    }

    @Test
    void matches_areSortedByScoreDescThenNameAsc() {
        User leader = student("Leader", Set.of(java), Set.of(TechRole.BACKEND), ExperienceLevel.ADVANCED, Availability.FULL_TIME);
        Team team = team(10L, leader, Set.of(java, react), Set.of(TechRole.BACKEND, TechRole.FRONTEND));

        // Missing: React. Uncovered: FRONTEND.
        User best = student("Zara", Set.of(react), Set.of(TechRole.FRONTEND), ExperienceLevel.ADVANCED, Availability.FULL_TIME); // 100
        User tieB = student("Bob", Set.of(), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);                        // 8
        User tieA = student("alice", Set.of(), Set.of(), ExperienceLevel.BEGINNER, Availability.WEEKENDS);                      // 8
        User middle = student("Carl", Set.of(react), Set.of(), ExperienceLevel.BEGINNER, Availability.PART_TIME);               // 61

        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
        when(teamRepository.findByHackathonIdOrderByNameAsc(1L)).thenReturn(List.of(team));
        when(userRepository.findByRoleOrderByNameAsc(Role.STUDENT)).thenReturn(List.of(tieB, middle, best, tieA));

        List<MatchResultDto> matches = matchingService.getMatches(10L);

        assertThat(matches).extracting(m -> m.user().name()).containsExactly("Zara", "Carl", "alice", "Bob");
        assertThat(matches).extracting(MatchResultDto::score).containsExactly(100.0, 61.0, 8.0, 8.0);
    }

    // ---------- helpers ----------

    private User student(String name, Set<Skill> skills, Set<TechRole> roles,
                         ExperienceLevel level, Availability availability) {
        return User.builder()
                .id(nextUserId++)
                .name(name)
                .email(name.toLowerCase() + "@test.com")
                .role(Role.STUDENT)
                .skills(new HashSet<>(skills))
                .preferredRoles(new HashSet<>(roles))
                .experienceLevel(level)
                .availability(availability)
                .build();
    }

    private Team team(Long id, User leader, Set<Skill> requiredSkills, Set<TechRole> requiredRoles) {
        Team team = Team.builder()
                .id(id)
                .name("Team " + id)
                .hackathon(hackathon)
                .leader(leader)
                .requiredSkills(new HashSet<>(requiredSkills))
                .requiredRoles(new HashSet<>(requiredRoles))
                .build();
        team.getMembers().add(leader);
        return team;
    }
}
