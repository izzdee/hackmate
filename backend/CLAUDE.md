# HackMate Backend — Claude Code instructions

Read `../CLAUDE.md` and `../docs/API_CONTRACT.md` first. The contract is binding: paths,
field names and JSON shapes must match it exactly. The frontend is built in parallel
against it.

## Stack
Java 17, Spring Boot 3, Spring MVC, Spring Data JPA, Hibernate, Spring Security, jjwt,
PostgreSQL, Maven, Lombok. Group id `com.hackmate`, artifact `hackmate-backend`.

## Package structure (`com.hackmate`)
`config` · `controller` · `dto` · `entity` · `enums` · `exception` · `repository` · `security` · `service` · `seed`

## Architecture rules
- Layered: Controller → Service → Repository → DB. Controllers only map HTTP; ALL business
  logic is in services.
- Constructor injection only (no field `@Autowired`).
- Never return entities from controllers — map to DTOs (avoids recursion, hides passwords).
- Request DTOs use Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`...).
- Custom exceptions (`ResourceNotFoundException`, `BadRequestException`,
  `ConflictException`, `ForbiddenException`) handled by one `@RestControllerAdvice` that
  returns `{status, message, timestamp}`.
- Use `@Transactional` on service methods that write.

## Entities
- **User**: id, name, email (unique), password (BCrypt), role, experienceLevel,
  preferredRoles (`@ElementCollection` of enum), availability, bio;
  `@ManyToMany Set<Skill> skills` via join table `user_skills`
- **Skill**: id, name (unique)
- **Hackathon**: id, title, description, organizer, startDate, endDate,
  registrationDeadline, maxTeamSize, mode
- **Team**: id, name, description, `@ManyToOne hackathon`, `@ManyToOne leader`,
  `@ManyToMany members` (join table `team_members`), `@ManyToMany requiredSkills`
  (join table `team_required_skills`), requiredRoles (`@ElementCollection`)
- **TeamRequest**: id, `@ManyToOne team`, `@ManyToOne user`, type, status, createdAt
- **Notification**: id, `@ManyToOne user`, message, isRead, createdAt

## Security
- Two public routes: `/api/auth/register`, `/api/auth/login`. Everything else authenticated.
- Stateless sessions, CSRF disabled, `BCryptPasswordEncoder`.
- `JwtService` (generate/validate, secret + expiry in application.properties),
  `JwtAuthenticationFilter extends OncePerRequestFilter`, custom `UserDetailsService`
  loading by email.
- Hackathon POST/PUT/DELETE → `hasRole('ADMIN')`.
- CORS: allow `http://localhost:5173`, all methods, `Authorization` header.
- A `SecurityUtils.getCurrentUser()` helper for services.
- Unauthenticated → 401 JSON, forbidden → 403 JSON (same error shape).

## Matching algorithm (`MatchingService`) — rule-based, deterministic
Weights as named constants: `SKILL_WEIGHT=50`, `ROLE_WEIGHT=25`, `EXPERIENCE_WEIGHT=15`,
`AVAILABILITY_WEIGHT=10`.

1. `missingSkills` = team.requiredSkills − (union of all members' skills)
2. `uncoveredRoles` = team.requiredRoles − (union of all members' preferredRoles)
3. Candidates = all STUDENTs who are not members of this team and not a member of any other
   team in the same hackathon.
4. Per candidate:
   - skill = |candidate.skills ∩ missingSkills| / |missingSkills| × 50 (0 if no missing skills)
   - role = 25 if candidate.preferredRoles ∩ uncoveredRoles is non-empty, else 0
   - experience = ADVANCED 15 · INTERMEDIATE 10 · BEGINNER 5
   - availability = FULL_TIME 10 · PART_TIME 6 · WEEKENDS 3
   - score = sum, rounded to 1 decimal
5. Sort by score desc, then name asc. Return score + breakdown.

`getSkillGap(teamId)` returns `missingSkills`.
Write JUnit tests for MatchingService covering these rules.

## Business rules
- Team creator becomes leader and first member.
- One team per student per hackathon (409 if violated).
- Member count must never exceed hackathon.maxTeamSize (400 "Team is full").
- No duplicate PENDING request for same team + user (409).
- Only the leader can invite, edit, delete; only the request's recipient can accept/reject
  (invite → invited user; join request → team leader).
- Accepting adds the member; on accept, auto-reject that user's other PENDING requests for
  the same hackathon.
- Leader cannot leave (must delete the team).
- Notifications created on: invite received, join request received, request accepted,
  request rejected.

## Seed data (`seed/DataSeeder implements CommandLineRunner`, only if DB is empty)
~20 skills (Java, Spring Boot, React, Flutter, Python, ML, UI/UX, Figma, PostgreSQL,
Docker, Node.js, etc.), 1 admin (`admin@hackmate.com` / `admin123`), 10 students with
varied skills/roles/levels (password `password123`), 3 hackathons, 2 teams.

## Config
`application.properties`: PostgreSQL `jdbc:postgresql://localhost:5432/hackmate`,
`spring.jpa.hibernate.ddl-auto=update`, `server.port=8080`, jwt secret + 24h expiry.
Read DB username/password from env vars with defaults.

## Testing
Keep a Postman collection at `backend/postman/HackMate.postman_collection.json` covering
every endpoint, with a login request that saves the token to a collection variable.

## Build order (finish + test each before the next)
1. Project setup, pom.xml, application.properties, app starts
2. Enums + entities + repositories
3. Exception handling + error format
4. Security + JWT + `/auth/register` + `/auth/login` ← do early; frontend needs it first
5. Users + skills
6. Hackathons
7. Teams
8. Requests + notifications
9. Matching + skill gap + unit tests
10. Seed data + Postman collection
11. Final check: every endpoint in API_CONTRACT.md works exactly as specified

## Working mode (auto mode — do not stop between steps)
- Work through ALL build steps in order without waiting for confirmation.
- After each step: verify that the app starts and the endpoints built so far work; fix any errors before moving on;
  then `git commit` that step with a clear message (e.g. `backend: step 4 - JWT auth`).
- Do not push unless asked.
- Only stop to ask if something is genuinely blocked (e.g. PostgreSQL not reachable,
  a contract ambiguity) — otherwise make a sensible choice and note it.
- When finished, write `NOTES.md` in this folder: what was built, how to run it, any
  deviations from the contract, and a short viva-friendly explanation of each module.
