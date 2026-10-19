# HackMate — Project Guide for Claude Code

HackMate is a college project: a hackathon team formation and skill-matching platform.
Students create skill-based profiles, browse hackathons, form teams, and find teammates
through invitations and join requests. The system ranks candidates with a **rule-based,
deterministic** weighted compatibility score and identifies team skill gaps.
**No AI/ML anywhere in the app.**

## Repo layout
```
hackmate/
├── CLAUDE.md              ← this file (shared rules)
├── docs/API_CONTRACT.md   ← SINGLE SOURCE OF TRUTH for endpoints + JSON shapes
├── backend/               ← Spring Boot (Person 1)  — see backend/CLAUDE.md
└── frontend/              ← React + Vite (Person 2) — see frontend/CLAUDE.md
```

## Team rules (both people)
- Only edit files inside your own folder (`backend/` or `frontend/`).
- `docs/API_CONTRACT.md` is shared. Never change it silently: if an endpoint or field must
  change, update the contract in the same commit and tell the other person.
- Branches: `backend/<feature>` and `frontend/<feature>`; merge to `main` via pull request.
- Commit small and often with clear messages (e.g. `backend: add JWT filter`).
- Keep code simple and readable — this project will be explained in a viva. Prefer clarity
  over cleverness, and add short comments on non-obvious logic.

## Tech stack (fixed — do not substitute)
- Backend: Java 17, Spring Boot 3, Spring MVC, Spring Data JPA, Hibernate, Spring Security,
  JWT (jjwt), PostgreSQL, Maven, Lombok
- Frontend: React (Vite), React Router v6, Axios, Tailwind CSS, react-hot-toast
- Tools: Postman, Git/GitHub

## Ports
- Backend: http://localhost:8080 (all endpoints under `/api`)
- Frontend: http://localhost:5173
