package com.hackmate.service;

import com.hackmate.dto.AuthResponse;
import com.hackmate.dto.LoginRequest;
import com.hackmate.dto.RegisterRequest;
import com.hackmate.dto.UserDto;
import com.hackmate.entity.User;
import com.hackmate.enums.Availability;
import com.hackmate.enums.ExperienceLevel;
import com.hackmate.enums.Role;
import com.hackmate.exception.ConflictException;
import com.hackmate.repository.UserRepository;
import com.hackmate.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /** Creates a STUDENT account. Profile details are filled in later via PUT /users/me. */
    @Transactional
    public UserDto register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.STUDENT)
                // Sensible defaults so the profile never has null enums.
                .experienceLevel(ExperienceLevel.BEGINNER)
                .availability(Availability.PART_TIME)
                .bio("")
                .build();

        return UserDto.from(userRepository.save(user));
    }

    /** Checks email + password (throws BadCredentialsException → 401) and returns a JWT. */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user.getEmail()), UserDto.from(user));
    }

    // Emails are stored lowercase so "Aryan@X.com" and "aryan@x.com" are the same account.
    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
