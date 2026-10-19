package com.hackmate.service;

import com.hackmate.dto.MyRequestsResponse;
import com.hackmate.dto.TeamRequestDto;
import com.hackmate.entity.Team;
import com.hackmate.entity.TeamRequest;
import com.hackmate.entity.User;
import com.hackmate.enums.RequestStatus;
import com.hackmate.enums.RequestType;
import com.hackmate.exception.BadRequestException;
import com.hackmate.exception.ConflictException;
import com.hackmate.exception.ForbiddenException;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.TeamRepository;
import com.hackmate.repository.TeamRequestRepository;
import com.hackmate.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Invites (leader → user) and join requests (user → team).
 * In both cases {@code request.user} is the non-leader side; the "recipient" who may
 * accept/reject is the invited user (INVITE) or the team leader (JOIN_REQUEST).
 */
@Service
@Transactional(readOnly = true)
public class RequestService {

    private final TeamRequestRepository teamRequestRepository;
    private final TeamRepository teamRepository;
    private final TeamService teamService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    public RequestService(TeamRequestRepository teamRequestRepository,
                          TeamRepository teamRepository,
                          TeamService teamService,
                          UserService userService,
                          NotificationService notificationService,
                          SecurityUtils securityUtils) {
        this.teamRequestRepository = teamRequestRepository;
        this.teamRepository = teamRepository;
        this.teamService = teamService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.securityUtils = securityUtils;
    }

    /** Leader invites a user to the team. */
    @Transactional
    public TeamRequestDto invite(Long teamId, Long userId) {
        Team team = teamService.findTeam(teamId);
        User me = securityUtils.getCurrentUser();
        teamService.requireLeader(team, me);
        User invitee = userService.findUser(userId);

        if (invitee.getId().equals(me.getId())) {
            throw new BadRequestException("You cannot invite yourself");
        }
        checkCanJoin(team, invitee, "User is already in a team for this hackathon");

        TeamRequest request = saveNewRequest(team, invitee, RequestType.INVITE);
        notificationService.notify(invitee, me.getName() + " invited you to join " + team.getName());
        return TeamRequestDto.from(request);
    }

    /** The logged-in user asks to join a team. */
    @Transactional
    public TeamRequestDto requestToJoin(Long teamId) {
        Team team = teamService.findTeam(teamId);
        User me = securityUtils.getCurrentUser();

        checkCanJoin(team, me, "You are already in a team for this hackathon");

        TeamRequest request = saveNewRequest(team, me, RequestType.JOIN_REQUEST);
        notificationService.notify(team.getLeader(), me.getName() + " requested to join " + team.getName());
        return TeamRequestDto.from(request);
    }

    public MyRequestsResponse getMyRequests() {
        User me = securityUtils.getCurrentUser();

        List<TeamRequest> incoming = new ArrayList<>();
        incoming.addAll(teamRequestRepository.findByUserIdAndTypeOrderByCreatedAtDesc(me.getId(), RequestType.INVITE));
        incoming.addAll(teamRequestRepository.findByTeamLeaderIdAndTypeOrderByCreatedAtDesc(me.getId(), RequestType.JOIN_REQUEST));

        List<TeamRequest> outgoing = new ArrayList<>();
        outgoing.addAll(teamRequestRepository.findByUserIdAndTypeOrderByCreatedAtDesc(me.getId(), RequestType.JOIN_REQUEST));
        outgoing.addAll(teamRequestRepository.findByTeamLeaderIdAndTypeOrderByCreatedAtDesc(me.getId(), RequestType.INVITE));

        return new MyRequestsResponse(newestFirst(incoming), newestFirst(outgoing));
    }

    /**
     * Recipient accepts: the user joins the team, and all of that user's other
     * PENDING requests in the same hackathon are automatically rejected.
     */
    @Transactional
    public TeamRequestDto accept(Long requestId) {
        TeamRequest request = findPendingRequestForRecipient(requestId);
        Team team = request.getTeam();
        User newMember = request.getUser();

        // Re-check the rules: things may have changed since the request was sent.
        if (teamRepository.existsByHackathonIdAndMembers_Id(team.getHackathon().getId(), newMember.getId())) {
            throw new ConflictException(newMember.getName() + " is already in a team for this hackathon");
        }
        if (isFull(team)) {
            throw new BadRequestException("Team is full");
        }

        team.getMembers().add(newMember);
        teamRepository.save(team);
        request.setStatus(RequestStatus.ACCEPTED);
        teamRequestRepository.save(request);

        autoRejectOtherPendingRequests(request);

        if (request.getType() == RequestType.INVITE) {
            notificationService.notify(team.getLeader(),
                    newMember.getName() + " accepted your invite to join " + team.getName());
        } else {
            notificationService.notify(newMember,
                    "Your request to join " + team.getName() + " was accepted");
        }
        return TeamRequestDto.from(request);
    }

    @Transactional
    public TeamRequestDto reject(Long requestId) {
        TeamRequest request = findPendingRequestForRecipient(requestId);
        request.setStatus(RequestStatus.REJECTED);
        teamRequestRepository.save(request);

        Team team = request.getTeam();
        if (request.getType() == RequestType.INVITE) {
            notificationService.notify(team.getLeader(),
                    request.getUser().getName() + " declined your invite to join " + team.getName());
        } else {
            notificationService.notify(request.getUser(),
                    "Your request to join " + team.getName() + " was rejected");
        }
        return TeamRequestDto.from(request);
    }

    // ---- helpers ----

    /** Common checks before an invite / join request is created. */
    private void checkCanJoin(Team team, User user, String alreadyInTeamMessage) {
        if (teamRepository.existsByHackathonIdAndMembers_Id(team.getHackathon().getId(), user.getId())) {
            throw new ConflictException(alreadyInTeamMessage);
        }
        if (isFull(team)) {
            throw new BadRequestException("Team is full");
        }
        if (teamRequestRepository.existsByTeamIdAndUserIdAndStatus(team.getId(), user.getId(), RequestStatus.PENDING)) {
            throw new ConflictException("A request between this user and team is already pending");
        }
    }

    private TeamRequest saveNewRequest(Team team, User user, RequestType type) {
        TeamRequest request = TeamRequest.builder()
                .team(team)
                .user(user)
                .type(type)
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS))
                .build();
        return teamRequestRepository.save(request);
    }

    /** Loads the request, checks that the current user may answer it and that it is still PENDING. */
    private TeamRequest findPendingRequestForRecipient(Long requestId) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + requestId));

        User me = securityUtils.getCurrentUser();
        User recipient = request.getType() == RequestType.INVITE
                ? request.getUser()
                : request.getTeam().getLeader();
        if (!recipient.getId().equals(me.getId())) {
            throw new ForbiddenException("Only the recipient of this request can respond to it");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This request has already been " + request.getStatus().name().toLowerCase());
        }
        return request;
    }

    private void autoRejectOtherPendingRequests(TeamRequest accepted) {
        User user = accepted.getUser();
        Long hackathonId = accepted.getTeam().getHackathon().getId();

        List<TeamRequest> others = teamRequestRepository
                .findByUserIdAndStatusAndTeamHackathonId(user.getId(), RequestStatus.PENDING, hackathonId);
        for (TeamRequest other : others) {
            if (other.getId().equals(accepted.getId())) {
                continue;
            }
            other.setStatus(RequestStatus.REJECTED);
            teamRequestRepository.save(other);
            notificationService.notify(other.getTeam().getLeader(), user.getName()
                    + " joined another team, so their pending request with " + other.getTeam().getName() + " was closed");
        }
    }

    private boolean isFull(Team team) {
        return team.getMembers().size() >= team.getHackathon().getMaxTeamSize();
    }

    private List<TeamRequestDto> newestFirst(List<TeamRequest> requests) {
        return requests.stream()
                .sorted(Comparator.comparing(TeamRequest::getCreatedAt)
                        .thenComparing(TeamRequest::getId)
                        .reversed())
                .map(TeamRequestDto::from)
                .toList();
    }
}
