package com.hackmate.service;

import com.hackmate.dto.SaveTeamRequest;
import com.hackmate.dto.TeamDto;
import com.hackmate.entity.Hackathon;
import com.hackmate.entity.Team;
import com.hackmate.entity.User;
import com.hackmate.exception.BadRequestException;
import com.hackmate.exception.ConflictException;
import com.hackmate.exception.ForbiddenException;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.TeamRepository;
import com.hackmate.repository.TeamRequestRepository;
import com.hackmate.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final HackathonService hackathonService;
    private final SkillService skillService;
    private final SecurityUtils securityUtils;

    public TeamService(TeamRepository teamRepository,
                       TeamRequestRepository teamRequestRepository,
                       HackathonService hackathonService,
                       SkillService skillService,
                       SecurityUtils securityUtils) {
        this.teamRepository = teamRepository;
        this.teamRequestRepository = teamRequestRepository;
        this.hackathonService = hackathonService;
        this.skillService = skillService;
        this.securityUtils = securityUtils;
    }

    /** The creator becomes the leader and the first member. */
    @Transactional
    public TeamDto create(SaveTeamRequest request) {
        User me = securityUtils.getCurrentUser();
        Hackathon hackathon = hackathonService.findHackathon(request.hackathonId());

        // Rule: one team per student per hackathon.
        if (teamRepository.existsByHackathonIdAndMembers_Id(hackathon.getId(), me.getId())) {
            throw new ConflictException("You are already in a team for this hackathon");
        }

        Team team = new Team();
        team.setHackathon(hackathon);
        team.setLeader(me);
        team.getMembers().add(me);
        copyFields(request, team);
        return TeamDto.from(teamRepository.save(team));
    }

    /** All teams, or only the teams of one hackathon if hackathonId is given. */
    public List<TeamDto> getAll(Long hackathonId) {
        List<Team> teams = hackathonId == null
                ? teamRepository.findAllByOrderByNameAsc()
                : teamRepository.findByHackathonIdOrderByNameAsc(hackathonId);
        return teams.stream().map(TeamDto::from).toList();
    }

    /** Teams the logged-in user is a member of (as leader or member). */
    public List<TeamDto> getMyTeams() {
        User me = securityUtils.getCurrentUser();
        return teamRepository.findByMembers_IdOrderByNameAsc(me.getId()).stream().map(TeamDto::from).toList();
    }

    public TeamDto getById(Long id) {
        return TeamDto.from(findTeam(id));
    }

    @Transactional
    public TeamDto update(Long id, SaveTeamRequest request) {
        Team team = findTeam(id);
        requireLeader(team, securityUtils.getCurrentUser());

        // Moving a team to another hackathon would break the one-team-per-hackathon rule for its members.
        if (!team.getHackathon().getId().equals(request.hackathonId())) {
            throw new BadRequestException("A team cannot be moved to a different hackathon");
        }

        copyFields(request, team);
        return TeamDto.from(teamRepository.save(team));
    }

    /** Only the leader can delete. Requests for the team are deleted with it. */
    @Transactional
    public void delete(Long id) {
        Team team = findTeam(id);
        requireLeader(team, securityUtils.getCurrentUser());
        teamRequestRepository.deleteAll(teamRequestRepository.findByTeamId(team.getId()));
        teamRepository.delete(team);
    }

    /** A member leaves the team. The leader cannot leave (they must delete the team). */
    @Transactional
    public void leave(Long id) {
        Team team = findTeam(id);
        User me = securityUtils.getCurrentUser();

        if (isLeader(team, me)) {
            throw new BadRequestException("The team leader cannot leave the team; delete the team instead");
        }
        boolean removed = team.getMembers().removeIf(member -> member.getId().equals(me.getId()));
        if (!removed) {
            throw new BadRequestException("You are not a member of this team");
        }
        teamRepository.save(team);
    }

    // ---- helpers shared with RequestService / MatchingService ----

    public Team findTeam(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + id));
    }

    public boolean isLeader(Team team, User user) {
        return team.getLeader().getId().equals(user.getId());
    }

    public boolean isMember(Team team, User user) {
        return team.getMembers().stream().anyMatch(member -> member.getId().equals(user.getId()));
    }

    public void requireLeader(Team team, User user) {
        if (!isLeader(team, user)) {
            throw new ForbiddenException("Only the team leader can do this");
        }
    }

    private void copyFields(SaveTeamRequest request, Team team) {
        team.setName(request.name().trim());
        team.setDescription(request.description());
        team.setRequiredSkills(skillService.findSkillsByIds(request.requiredSkillIds()));
        team.setRequiredRoles(request.requiredRoles() == null
                ? new HashSet<>()
                : new HashSet<>(request.requiredRoles()));
    }
}
