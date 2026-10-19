package com.hackmate.repository;

import com.hackmate.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByHackathonIdOrderByNameAsc(Long hackathonId);

    List<Team> findAllByOrderByNameAsc();

    /** Teams that the given user is a member of. */
    List<Team> findByMembers_IdOrderByNameAsc(Long userId);

    /** Is the user already a member of some team in this hackathon? */
    boolean existsByHackathonIdAndMembers_Id(Long hackathonId, Long userId);
}
