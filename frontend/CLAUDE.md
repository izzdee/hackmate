# HackMate Frontend — Claude Code instructions

Read `../CLAUDE.md` and `../docs/API_CONTRACT.md` first. The contract is binding: use the
exact paths, field names and JSON shapes. The backend is being built in parallel.

## Stack
React (Vite, JavaScript), React Router v6, Axios, Tailwind CSS, react-hot-toast,
lucide-react for icons. No other UI libraries unless asked.

## Folder structure (`src/`)
```
api/axios.js          ← Axios instance, base URL, interceptors
config.js             ← API_BASE_URL, USE_MOCK flag
context/AuthContext.jsx
services/             ← authService, userService, skillService, hackathonService,
                        teamService, requestService, notificationService
mocks/                ← mock data matching API_CONTRACT shapes exactly
components/           ← Navbar, ProtectedRoute, AdminRoute, SkillChip, UserCard,
                        TeamCard, HackathonCard, ScoreBar, Modal, Spinner, EmptyState
pages/                ← one file per page
```

## Mock mode (essential — backend isn't ready yet)
- `config.js` exports `USE_MOCK = true`.
- Every service function: if `USE_MOCK`, return mock data after a ~300ms delay;
  otherwise call the real API.
- Mocks must follow API_CONTRACT shapes EXACTLY, and mock logic should be realistic
  (e.g. accepting a request adds the member; skill gap computed from mock team members).
- Pages/components NEVER call Axios directly — only through `services/`.
- Switching `USE_MOCK` to `false` must require zero UI changes.

## Auth
- Login stores `{token, user}` in localStorage + `AuthContext`.
- Axios request interceptor adds `Authorization: Bearer <token>`.
- Response interceptor: 401 → clear auth, redirect to `/login`; other errors → toast with
  `error.response.data.message`.
- `ProtectedRoute` for logged-in pages, `AdminRoute` for ADMIN pages.

## Routes & pages
| Route | Page | Contents |
|---|---|---|
| `/login`, `/register` | Auth | validated forms, error messages |
| `/` | Dashboard | my teams, pending request count, upcoming hackathons |
| `/profile` | Profile | edit name, bio, experience, availability, preferred roles (chips), skills (searchable multi-select from `/skills`) |
| `/users/:id` | Public profile | user info + skills, "Invite to my team" |
| `/hackathons` | List | cards (dates, mode, team size), search + mode filter |
| `/hackathons/:id` | Detail | info, teams list with "Request to Join", "Create Team" modal |
| `/teams/:id` | Team | see below |
| `/search` | Find Teammates | filter by skill + role, UserCards with Invite |
| `/requests` | Requests | Incoming / Outgoing tabs, Accept/Reject, status badges |
| `/admin/hackathons` | Admin | hackathon table with create/edit/delete |

**Team page (the showcase page — make it polished):**
- Header: name, hackathon, member count / maxTeamSize
- Members list with skills; leader badge
- **Skill Gap panel**: required skills as chips — covered = green, missing = red;
  uncovered roles listed
- **Find Matches tab** (leader only): ranked candidate cards with rank number, ScoreBar
  (0–100), expandable breakdown (skill /50, role /25, experience /15, availability /10),
  Invite button
- Leader: Edit / Delete. Member: Leave. Non-member: Request to Join.

**Navbar:** logo, links, notification bell with unread badge (poll
`/notifications/unread-count` every 30s), dropdown list with mark-as-read, user menu
with logout.

## UI rules
- Clean, modern, responsive (mobile + desktop). Consistent colors/spacing via Tailwind.
- Every data view has loading, empty and error states.
- Toasts for success/failure of every action.
- Disable buttons while requests are in flight.
- Hide actions the user isn't allowed to do (non-leader shouldn't see Invite).

## Build order (finish + check each before the next)
1. Vite + Tailwind + Router setup, folder structure, config.js
2. Mock data for all shapes in API_CONTRACT.md
3. Axios instance, services layer, AuthContext, login/register, protected routes
4. Layout + Navbar
5. Profile
6. Hackathons list + detail + create team
7. Team page (skill gap + matches)
8. Find Teammates + public profile
9. Requests
10. Notifications
11. Admin page
12. Integration: set `USE_MOCK=false`, test each module against the real backend, fix
    mismatches by checking API_CONTRACT.md (report contract issues rather than hacking
    around them)

## Working mode (auto mode — do not stop between steps)
- Work through ALL build steps in order without waiting for confirmation.
- After each step: verify that `npm run build` succeeds and the pages built so far render; fix any errors before moving on;
  then `git commit` that step with a clear message (e.g. `backend: step 4 - JWT auth`).
- Do not push unless asked.
- Only stop to ask if something is genuinely blocked (e.g. PostgreSQL not reachable,
  a contract ambiguity) — otherwise make a sensible choice and note it.
- When finished, write `NOTES.md` in this folder: what was built, how to run it, any
  deviations from the contract, and a short viva-friendly explanation of each module.
