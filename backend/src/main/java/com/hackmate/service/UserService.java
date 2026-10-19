package com.hackmate.service;

import com.hackmate.dto.UpdateProfileRequest;
import com.hackmate.dto.UserDto;
import com.hackmate.entity.User;
import com.hackmate.enums.Role;
import com.hackmate.enums.TechRole;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.UserRepository;
import com.hackmate.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final SkillService skillService;
    private final SecurityUtils securityUtils;

    public UserService(UserRepository userRepository, SkillService skillService, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.skillService = skillService;
        this.securityUtils = securityUtils;
    }

    public UserDto getMe() {
        return UserDto.from(securityUtils.getCurrentUser());
    }

    @Transactional
    public UserDto updateMe(UpdateProfileRequest request) {
        User user = securityUtils.getCurrentUser();
        user.setName(request.name().trim());
        user.setBio(request.bio() == null ? "" : request.bio().trim());
        user.setExperienceLevel(request.experienceLevel());
        user.setAvailability(request.availability());
        user.setPreferredRoles(request.preferredRoles() == null
                ? new HashSet<>()
                : new HashSet<>(request.preferredRoles()));
        user.setSkills(skillService.findSkillsByIds(request.skillIds()));
        return UserDto.from(userRepository.save(user));
    }

    public UserDto getById(Long id) {
        return UserDto.from(findUser(id));
    }

    /**
     * "Find teammates": all students except the caller, optionally filtered by
     * skill name (case-insensitive) and/or preferred role.
     */
    public List<UserDto> search(String skill, TechRole role) {
        User me = securityUtils.getCurrentUser();
        String skillFilter = (skill == null || skill.isBlank()) ? null : skill.trim();

        return userRepository.findByRoleOrderByNameAsc(Role.STUDENT).stream()
                .filter(user -> !user.getId().equals(me.getId()))
                .filter(user -> skillFilter == null || user.getSkills().stream()
                        .anyMatch(s -> s.getName().equalsIgnoreCase(skillFilter)))
                .filter(user -> role == null || user.getPreferredRoles().contains(role))
                .map(UserDto::from)
                .toList();
    }

    public User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }
}
