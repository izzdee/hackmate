package com.hackmate.service;

import com.hackmate.dto.HackathonDto;
import com.hackmate.dto.HackathonRequest;
import com.hackmate.entity.Hackathon;
import com.hackmate.entity.Team;
import com.hackmate.exception.BadRequestException;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.HackathonRepository;
import com.hackmate.repository.TeamRepository;
import com.hackmate.repository.TeamRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class HackathonService {

    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final TeamRequestRepository teamRequestRepository;

    public HackathonService(HackathonRepository hackathonRepository,
                            TeamRepository teamRepository,
                            TeamRequestRepository teamRequestRepository) {
        this.hackathonRepository = hackathonRepository;
        this.teamRepository = teamRepository;
        this.teamRequestRepository = teamRequestRepository;
    }

    public List<HackathonDto> getAll() {
        return hackathonRepository.findAllByOrderByStartDateAsc().stream().map(HackathonDto::from).toList();
    }

    public HackathonDto getById(Long id) {
        return HackathonDto.from(findHackathon(id));
    }

    @Transactional
    public HackathonDto create(HackathonRequest request) {
        validateDates(request);
        Hackathon hackathon = new Hackathon();
        copyFields(request, hackathon);
        return HackathonDto.from(hackathonRepository.save(hackathon));
    }

    @Transactional
    public HackathonDto update(Long id, HackathonRequest request) {
        Hackathon hackathon = findHackathon(id);
        validateDates(request);

        // Shrinking the team size must not make an existing team "over-full".
        boolean tooSmall = teamRepository.findByHackathonIdOrderByNameAsc(id).stream()
                .anyMatch(team -> team.getMembers().size() > request.maxTeamSize());
        if (tooSmall) {
            throw new BadRequestException("maxTeamSize is smaller than the size of an existing team");
        }

        copyFields(request, hackathon);
        return HackathonDto.from(hackathonRepository.save(hackathon));
    }

    /** Deleting a hackathon also deletes its teams and their requests. */
    @Transactional
    public void delete(Long id) {
        Hackathon hackathon = findHackathon(id);
        for (Team team : teamRepository.findByHackathonIdOrderByNameAsc(id)) {
            teamRequestRepository.deleteAll(teamRequestRepository.findByTeamId(team.getId()));
            teamRepository.delete(team);
        }
        hackathonRepository.delete(hackathon);
    }

    public Hackathon findHackathon(Long id) {
        return hackathonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon not found with id " + id));
    }

    private void validateDates(HackathonRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("endDate cannot be before startDate");
        }
        if (request.registrationDeadline() != null && request.registrationDeadline().isAfter(request.endDate())) {
            throw new BadRequestException("registrationDeadline cannot be after endDate");
        }
    }

    private void copyFields(HackathonRequest request, Hackathon hackathon) {
        hackathon.setTitle(request.title().trim());
        hackathon.setDescription(request.description());
        hackathon.setOrganizer(request.organizer());
        hackathon.setStartDate(request.startDate());
        hackathon.setEndDate(request.endDate());
        hackathon.setRegistrationDeadline(request.registrationDeadline());
        hackathon.setMaxTeamSize(request.maxTeamSize());
        hackathon.setMode(request.mode());
    }
}
