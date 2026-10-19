package com.hackmate.controller;

import com.hackmate.dto.MyRequestsResponse;
import com.hackmate.dto.TeamRequestDto;
import com.hackmate.service.RequestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Invites and join requests. Paths follow API_CONTRACT.md exactly. */
@RestController
@RequestMapping("/api")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/teams/{id}/invite/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamRequestDto invite(@PathVariable Long id, @PathVariable Long userId) {
        return requestService.invite(id, userId);
    }

    @PostMapping("/teams/{id}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamRequestDto join(@PathVariable Long id) {
        return requestService.requestToJoin(id);
    }

    @GetMapping("/requests/me")
    public MyRequestsResponse getMyRequests() {
        return requestService.getMyRequests();
    }

    @PutMapping("/requests/{id}/accept")
    public TeamRequestDto accept(@PathVariable Long id) {
        return requestService.accept(id);
    }

    @PutMapping("/requests/{id}/reject")
    public TeamRequestDto reject(@PathVariable Long id) {
        return requestService.reject(id);
    }
}
