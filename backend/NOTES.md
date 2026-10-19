# HackMate Backend — Notes

## What was built
A Spring Boot 3 REST API (Java 17, PostgreSQL, JWT) that implements every endpoint in
`../docs/API_CONTRACT.md`: auth, users and skills, hackathons (admin CRUD), teams, invites
and join requests, notifications, and rule-based teammate matching with skill-gap analysis.

- 14 JUnit tests for `MatchingService` (`src/test/.../MatchingServiceTest.java`)
- A Postman collection at `postman/HackMate.postman_collection.json` with 37 requests that
  cover all 29 endpoints. The login requests save tokens into collection variables. The
  run creates its own hackathon and team and deletes them at the end, so you can run it
  more than once.
- Demo data is seeded when the database is empty.

## How to run
1. Start PostgreSQL and create the database: `CREATE DATABASE hackmate;`
2. Set DB credentials if they differ from the defaults (`postgres` / `postgres`):
   - PowerShell: `$env:DB_USERNAME="postgres"; $env:DB_PASSWORD="yourpassword"`
   - Optional: `DB_URL` (default `jdbc:postgresql://localhost:5432/hackmate`)
   - Recommended: `JWT_SECRET`, a Base64 key of at least 256 bits (`openssl rand -base64 32`).
     If it's unset, a random key is generated at startup, so logins stop working after a restart.
3. From `backend/`: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
4. API: `http://localhost:8080/api`. Run the tests with `./mvnw test`.

**Seeded logins:** `admin@hackmate.com` / `admin123`, and students `aryan@`, `deeksha@`,
`rohan@`, `priya@`, `karan@`, `kavya@`, `arjun@`, `sneha@`, `vikram@`, `ananya@hackmate.com`,
all with password `password123`. Team 1, "Code Crusaders" (leader Aryan), is the best team
for demoing skill gap and matches. It also has a pending join request from Kavya.

## Deviations and choices not covered by the contract
- **New accounts get defaults:** `experienceLevel=BEGINNER`, `availability=PART_TIME`,
  `bio=""`, so profile enums are never null.
- **Emails are stored lowercase.** Login and register ignore case.
- **`/users/search`** returns students only, excludes the caller, matches skill names exactly
  but case-insensitively, and sorts by name.
- **`PUT /teams/{id}`** rejects a change of `hackathonId` with 400, because moving a team
  could break the one-team-per-hackathon rule.
- **`GET /teams/{id}/matches`** and **`/skill-gap`** work for any logged-in user. The
  contract doesn't restrict them; the frontend shows "Find Matches" only to the leader.
- **Matching breakdown values are numbers with decimals** (`25.0`, not `25`). In JSON these
  are the same value.
- **Extra business rules:**
  - You cannot invite yourself.
  - A hackathon's `maxTeamSize` cannot be reduced below the size of an existing team (400).
  - `endDate` must be on or after `startDate`, and `registrationDeadline` cannot be after
    `endDate` (400).
  - Deleting a hackathon also deletes its teams and their requests.
- **When an accept auto-rejects other pending requests**, the leaders of those teams get a
  notification saying the request was closed.
- **Requests that were already answered:** accepting or rejecting one returns 400
  ("This request has already been accepted").
- **Timestamps** (`createdAt`, error `timestamp`) are cut to whole seconds to match the
  contract format `2026-10-19T10:00:00`.
- No changes were made to `API_CONTRACT.md`.

## Module guide (viva-friendly)
- **entity:** JPA classes mapped to tables.
  - `User` (table `users`, because "user" is reserved in PostgreSQL), `Skill`, `Hackathon`,
    `Team`, `TeamRequest`, `Notification`.
  - Many-to-many links use join tables: `user_skills`, `team_members`, `team_required_skills`.
  - Enum lists use `@ElementCollection`.
- **enums:** fixed value sets from the contract. Role-in-team values live in `TechRole`.
- **repository:** Spring Data JPA interfaces. Queries come from method names, e.g.
  `existsByHackathonIdAndMembers_Id` means "is this user in any team of this hackathon?".
- **dto:** Java records that define exactly what the API sends and receives.
  - Entities are never returned, so passwords never leak and bidirectional links can't recurse.
  - Request DTOs use Bean Validation annotations.
- **exception:** four custom exceptions and one `GlobalExceptionHandler`
  (`@RestControllerAdvice`) that turns every error into `{status, message, timestamp}`.
- **security:**
  - Stateless JWT. `JwtService` signs and verifies tokens with HMAC-SHA; the subject is the
    email and the token expires after 24h.
  - `JwtAuthenticationFilter` reads `Authorization: Bearer ...` on each request.
  - `CustomUserDetailsService` loads users by email.
  - `SecurityErrorHandler` writes JSON for 401/403, because those happen in filters before
    any controller runs.
  - `SecurityUtils.getCurrentUser()` returns the logged-in user.
- **config/SecurityConfig:**
  - Public routes: register and login. Everything else needs a token.
  - Admin-only hackathon writes are enforced twice: by URL rules and by `@PreAuthorize`.
  - Uses BCrypt, disables CSRF (tokens, not cookies), and allows CORS from `localhost:5173`.
- **service:** all business logic.
  - `TeamService`: the creator becomes leader and first member, one team per hackathon,
    only the leader can edit or delete, and the leader cannot leave.
  - `RequestService`: no duplicate pending requests, a "Team is full" check, only the
    recipient can answer, accepting adds the member and auto-rejects their other pending
    requests in that hackathon, and it creates notifications.
- **MatchingService:** deterministic weighted score.
  - `missingSkills` = required skills − members' skills.
  - `uncoveredRoles` = required roles − members' roles.
  - Candidates are students who are not in any team of that hackathon.
  - Score = skill (share of missing skills the candidate has × 50) + role (25 if they cover
    an uncovered role) + experience (15/10/5) + availability (10/6/3).
  - Rounded to 1 decimal, sorted by score descending, then name.
  - No AI/ML: the same input always gives the same ranking.
- **controller:** thin HTTP mapping only. Each method calls one service method.
- **seed/DataSeeder:** a `CommandLineRunner` that runs only on an empty DB. It adds 20
  skills, 1 admin, 10 students, 3 hackathons, 2 teams and 1 pending request.
