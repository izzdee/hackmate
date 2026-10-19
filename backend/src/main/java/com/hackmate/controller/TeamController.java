package com.hackmate.controller;

import com.hackmate.dto.SaveTeamRequest;
import com.hackmate.dto.TeamDto;
import com.hackmate.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamDto create(@Valid @RequestBody SaveTeamRequest request) {
        return teamService.create(request);
    }

    @GetMapping
    public List<TeamDto> getAll(@RequestParam(required = false) Long hackathonId) {
        return teamService.getAll(hackathonId);
    }

    @GetMapping("/my")
    public List<TeamDto> getMyTeams() {
        return teamService.getMyTeams();
    }

    @GetMapping("/{id}")
    public TeamDto getById(@PathVariable Long id) {
        return teamService.getById(id);
    }

    @PutMapping("/{id}")
    public TeamDto update(@PathVariable Long id, @Valid @RequestBody SaveTeamRequest request) {
        return teamService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        teamService.delete(id);
    }

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@PathVariable Long id) {
        teamService.leave(id);
    }
}
