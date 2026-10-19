package com.hackmate.controller;

import com.hackmate.dto.HackathonDto;
import com.hackmate.dto.HackathonRequest;
import com.hackmate.service.HackathonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Anyone logged in can read hackathons; only ADMIN can create/update/delete. */
@RestController
@RequestMapping("/api/hackathons")
public class HackathonController {

    private final HackathonService hackathonService;

    public HackathonController(HackathonService hackathonService) {
        this.hackathonService = hackathonService;
    }

    @GetMapping
    public List<HackathonDto> getAll() {
        return hackathonService.getAll();
    }

    @GetMapping("/{id}")
    public HackathonDto getById(@PathVariable Long id) {
        return hackathonService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public HackathonDto create(@Valid @RequestBody HackathonRequest request) {
        return hackathonService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public HackathonDto update(@PathVariable Long id, @Valid @RequestBody HackathonRequest request) {
        return hackathonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        hackathonService.delete(id);
    }
}
