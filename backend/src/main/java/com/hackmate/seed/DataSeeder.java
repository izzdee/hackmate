package com.hackmate.seed;

import com.hackmate.entity.*;
import com.hackmate.enums.*;
import com.hackmate.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Fills an EMPTY database with demo data on startup:
 * 20 skills, 1 admin, 10 students, 3 hackathons, 2 teams and one pending join request.
 * Logins: admin@hackmate.com / admin123, any student (e.g. aryan@hackmate.com) / password123.
 */
@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String STUDENT_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    /** Skill name → saved entity, so students/teams can refer to skills by name. */
    private final Map<String, Skill> skills = new HashMap<>();

    public DataSeeder(UserRepository userRepository,
                      SkillRepository skillRepository,
                      HackathonRepository hackathonRepository,
                      TeamRepository teamRepository,
                      TeamRequestRepository teamRequestRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.hackathonRepository = hackathonRepository;
        this.teamRepository = teamRepository;
        this.teamRequestRepository = teamRequestRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0 || skillRepository.count() > 0) {
            log.info("Database already has data - skipping seed");
            return;
        }

        seedSkills();
        seedAdmin();

        User aryan = student("Aryan Sharma", "aryan@hackmate.com", ExperienceLevel.INTERMEDIATE, Availability.FULL_TIME,
                "Backend developer who loves clean APIs.", List.of(TechRole.BACKEND),
                "Java", "Spring Boot", "PostgreSQL");
        User deeksha = student("Deeksha Rao", "deeksha@hackmate.com", ExperienceLevel.ADVANCED, Availability.FULL_TIME,
                "Mobile dev, shipped two Flutter apps.", List.of(TechRole.MOBILE, TechRole.FRONTEND),
                "Flutter", "Kotlin", "Figma");
        User rohan = student("Rohan Mehta", "rohan@hackmate.com", ExperienceLevel.BEGINNER, Availability.WEEKENDS,
                "First-year student learning web dev.", List.of(TechRole.FRONTEND),
                "HTML/CSS", "JavaScript");
        student("Priya Nair", "priya@hackmate.com", ExperienceLevel.ADVANCED, Availability.PART_TIME,
                "UI/UX designer with a love for clean interfaces.", List.of(TechRole.UI_UX, TechRole.FRONTEND),
                "Figma", "UI/UX", "React");
        student("Karan Gupta", "karan@hackmate.com", ExperienceLevel.INTERMEDIATE, Availability.FULL_TIME,
                "ML enthusiast, Kaggle competitor.", List.of(TechRole.ML),
                "Python", "Machine Learning", "TensorFlow");
        User kavya = student("Kavya Iyer", "kavya@hackmate.com", ExperienceLevel.INTERMEDIATE, Availability.FULL_TIME,
                "Full-stack developer, React + Node.", List.of(TechRole.FULLSTACK, TechRole.FRONTEND),
                "React", "Node.js", "TypeScript", "MongoDB");
        student("Arjun Singh", "arjun@hackmate.com", ExperienceLevel.ADVANCED, Availability.WEEKENDS,
                "DevOps and cloud person.", List.of(TechRole.DEVOPS, TechRole.BACKEND),
                "Docker", "AWS", "Git", "Node.js");
        student("Sneha Patel", "sneha@hackmate.com", ExperienceLevel.BEGINNER, Availability.FULL_TIME,
                "Learning data science.", List.of(TechRole.ML),
                "Python", "PostgreSQL");
        student("Vikram Joshi", "vikram@hackmate.com", ExperienceLevel.INTERMEDIATE, Availability.PART_TIME,
                "Android developer.", List.of(TechRole.MOBILE),
                "Android", "Kotlin", "Java");
        student("Ananya Das", "ananya@hackmate.com", ExperienceLevel.ADVANCED, Availability.FULL_TIME,
                "Frontend engineer and design-system nerd.", List.of(TechRole.FRONTEND, TechRole.UI_UX),
                "React", "TypeScript", "Figma", "JavaScript");

        Hackathon sih = hackathonRepository.save(Hackathon.builder()
                .title("Smart India Hackathon 2026")
                .description("A nationwide initiative to solve pressing problems with technology.")
                .organizer("Ministry of Education")
                .startDate(LocalDate.of(2026, 11, 20))
                .endDate(LocalDate.of(2026, 11, 22))
                .registrationDeadline(LocalDate.of(2026, 11, 10))
                .maxTeamSize(4)
                .mode(HackathonMode.OFFLINE)
                .build());
        Hackathon codeSprint = hackathonRepository.save(Hackathon.builder()
                .title("CodeSprint Online")
                .description("A 48-hour online hackathon for mobile and web apps.")
                .organizer("College Coding Club")
                .startDate(LocalDate.of(2026, 12, 5))
                .endDate(LocalDate.of(2026, 12, 7))
                .registrationDeadline(LocalDate.of(2026, 11, 30))
                .maxTeamSize(3)
                .mode(HackathonMode.ONLINE)
                .build());
        hackathonRepository.save(Hackathon.builder()
                .title("GreenTech Innovation Challenge")
                .description("Build solutions for sustainability and climate action.")
                .organizer("Tech for Good Foundation")
                .startDate(LocalDate.of(2027, 1, 15))
                .endDate(LocalDate.of(2027, 1, 17))
                .registrationDeadline(LocalDate.of(2027, 1, 5))
                .maxTeamSize(5)
                .mode(HackathonMode.OFFLINE)
                .build());

        // Team 1: Aryan (leader) + Rohan. Missing React, Figma, Python → good demo for matching.
        Team codeCrusaders = team("Code Crusaders", "Building a smart grievance-redressal portal.", sih, aryan,
                List.of(rohan), List.of(TechRole.FRONTEND, TechRole.UI_UX, TechRole.ML),
                "Java", "React", "Figma", "Python");
        // Team 2: Deeksha alone, in a different hackathon.
        team("Pixel Pioneers", "A Flutter app for campus events.", codeSprint, deeksha,
                List.of(), List.of(TechRole.MOBILE, TechRole.BACKEND),
                "Flutter", "Node.js", "MongoDB");

        // One pending join request so the Requests page has something to show.
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        teamRequestRepository.save(TeamRequest.builder()
                .team(codeCrusaders).user(kavya)
                .type(RequestType.JOIN_REQUEST).status(RequestStatus.PENDING)
                .createdAt(now).build());
        notificationRepository.save(Notification.builder()
                .user(aryan).message(kavya.getName() + " requested to join " + codeCrusaders.getName())
                .isRead(false).createdAt(now).build());

        log.info("Seeded demo data: {} skills, {} users, {} hackathons, {} teams",
                skillRepository.count(), userRepository.count(), hackathonRepository.count(), teamRepository.count());
    }

    private void seedSkills() {
        List<String> names = List.of(
                "Java", "Spring Boot", "React", "Flutter", "Python", "Machine Learning", "UI/UX", "Figma",
                "PostgreSQL", "Docker", "Node.js", "JavaScript", "TypeScript", "MongoDB", "AWS", "Kotlin",
                "Android", "TensorFlow", "Git", "HTML/CSS");
        for (String name : names) {
            skills.put(name, skillRepository.save(Skill.builder().name(name).build()));
        }
    }

    private void seedAdmin() {
        userRepository.save(User.builder()
                .name("Admin")
                .email("admin@hackmate.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .experienceLevel(ExperienceLevel.ADVANCED)
                .availability(Availability.FULL_TIME)
                .bio("Platform administrator")
                .build());
    }

    private User student(String name, String email, ExperienceLevel level, Availability availability,
                         String bio, List<TechRole> roles, String... skillNames) {
        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(STUDENT_PASSWORD))
                .role(Role.STUDENT)
                .experienceLevel(level)
                .availability(availability)
                .bio(bio)
                .preferredRoles(new HashSet<>(roles))
                .skills(skillsNamed(skillNames))
                .build());
    }

    private Team team(String name, String description, Hackathon hackathon, User leader, List<User> otherMembers,
                      List<TechRole> requiredRoles, String... requiredSkillNames) {
        Team team = Team.builder()
                .name(name)
                .description(description)
                .hackathon(hackathon)
                .leader(leader)
                .requiredRoles(new HashSet<>(requiredRoles))
                .requiredSkills(skillsNamed(requiredSkillNames))
                .build();
        team.getMembers().add(leader);
        team.getMembers().addAll(otherMembers);
        return teamRepository.save(team);
    }

    private Set<Skill> skillsNamed(String... names) {
        Set<Skill> result = new HashSet<>();
        for (String name : names) {
            result.add(Objects.requireNonNull(skills.get(name), "Unknown seed skill: " + name));
        }
        return result;
    }
}
