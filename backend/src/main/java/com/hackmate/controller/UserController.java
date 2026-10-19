package com.hackmate.controller;

import com.hackmate.dto.UpdateProfileRequest;
import com.hackmate.dto.UserDto;
import com.hackmate.enums.TechRole;
import com.hackmate.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDto getMe() {
        return userService.getMe();
    }

    @PutMapping("/me")
    public UserDto updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateMe(request);
    }

    @GetMapping("/search")
    public List<UserDto> search(@RequestParam(required = false) String skill,
                                @RequestParam(required = false) TechRole role) {
        return userService.search(skill, role);
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        return userService.getById(id);
    }
}
