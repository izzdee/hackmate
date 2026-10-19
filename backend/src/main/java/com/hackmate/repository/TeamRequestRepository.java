package com.hackmate.repository;

import com.hackmate.entity.TeamRequest;
import com.hackmate.enums.RequestStatus;
import com.hackmate.enums.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {

    boolean existsByTeamIdAndUserIdAndStatus(Long teamId, Long userId, RequestStatus status);

    /** Requests where the user is the non-leader side (invites to them / join requests by them). */
    List<TeamRequest> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, RequestType type);

    /** Requests on teams led by the given user. */
    List<TeamRequest> findByTeamLeaderIdAndTypeOrderByCreatedAtDesc(Long leaderId, RequestType type);

    /** Used to auto-reject a user's other pending requests in the same hackathon. */
    List<TeamRequest> findByUserIdAndStatusAndTeamHackathonId(Long userId, RequestStatus status, Long hackathonId);

    List<TeamRequest> findByTeamId(Long teamId);
}
