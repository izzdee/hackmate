# HackMate Frontend — Notes

## What was built
A complete React (Vite) frontend for HackMate. It runs fully in **mock mode** (no backend
needed), and switches to the real Spring Boot API with one flag.

| Route | Page | Highlights |
|---|---|---|
| `/login`, `/register` | Auth | Validated forms, inline + toast errors, demo-account shortcuts in mock mode |
| `/` | Dashboard | My teams, pending incoming requests count, upcoming hackathons, "complete your profile" nudge |
| `/profile` | Profile | Edit name, bio, experience, availability, preferred roles (chips), searchable skill multi-select |
| `/users/:id` | Public profile | Info + skills, "Invite to my team" (only for leaders) |
| `/hackathons` | List | Cards, text search, Online/Offline filter, "show past" toggle |
| `/hackathons/:id` | Detail | Event info, teams with "Request to Join", "Create Team" modal |
| `/teams/:id` | Team (showcase) | Header with member slots, members with leader badge, Skill Gap panel, leader-only Find Matches tab with ranked cards, ScoreBar, expandable breakdown and Invite; Edit/Delete (leader), Leave (member), Request to Join (others) |
| `/search` | Find Teammates | Filter by skill + role, UserCards, Invite modal |
| `/requests` | Requests | Incoming / Outgoing tabs, pending counts, Accept/Reject, status badges |
| `/admin/hackathons` | Admin | Table with create / edit / delete (ADMIN only) |

The Navbar has a notification bell (polls unread count every 30s and on navigation),
a dropdown with "Mark read" / "Mark all as read", and a user menu with logout.

## How to run
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173, mock mode
```
Demo accounts in mock mode (also clickable on the login page):
- `aryan@example.com` / `password123`: student, leader of "Code Crusaders"
- `deeksha@example.com` / `password123`: student, member of "Neural Ninjas"
- `admin@hackmate.com` / `admin123`: admin

Mock data lives in your browser's localStorage. Use **"Reset demo data"** in the footer to restore the seed.

**Against the real backend** (no code changes needed):
```bash
VITE_USE_MOCK=false npm run dev
```
Optional: `VITE_API_BASE_URL` overrides `http://localhost:8080/api`.

## Folder structure (`src/`)
```
api/        axios.js (instance + interceptors), authStorage.js, errorHandler.js
config.js   API_BASE_URL, USE_MOCK, MOCK_DELAY
context/    AuthContext.jsx
services/   auth, user, skill, hackathon, team, request, notification services
mocks/      seed.js (data), db.js (in-memory DB + serializers), handlers.js (fake API),
            matching.js (scoring), mockCall.js (delay + error shaping)
components/ Navbar, Layout, ProtectedRoute, AdminRoute, SkillChip, UserCard, TeamCard,
            HackathonCard, ScoreBar, Modal, Spinner, EmptyState, … + team/ (SkillGapPanel, MatchCard)
hooks/      useFetch (loading/error/data), useClickOutside, useLedTeams
pages/      one file per page
utils/      constants.js (enum labels), format.js (dates)
```

## Integration status (build step 12)
- **No backend exists yet.** `backend/` contains only its CLAUDE.md and nothing listens on port 8080,
  so end-to-end testing against the real API could not be done.
- What was verified: with `VITE_USE_MOCK=false` the app calls `POST http://localhost:8080/api/auth/login`
  (and the other contract URLs), and shows "Cannot reach the server. Is the backend running?".
- When the backend is ready: run `VITE_USE_MOCK=false npm run dev`, log in with the seeded
  accounts and click through each page. Errors show as toasts carrying the backend's `message`.

## Deviations / assumptions / contract notes for the backend teammate
None of these change the contract. They are places where the contract is silent:
1. **Register returns no token**, so the frontend calls `/auth/login` right after `/auth/register`.
2. **Uncovered roles** have no endpoint, so the Team page computes them client-side
   (required roles − members' preferred roles), the same definition as the backend's MatchingService.
3. **No "mark all read" endpoint.** "Mark all as read" sends one `PUT /notifications/{id}/read` per unread item.
4. **`/users/search`**: the mock matches `skill` by exact skill name (case-insensitive) and leaves out
   the caller and admins. The contract doesn't say; the backend may differ, and the UI works either way.
5. **`/teams/{id}/matches`** isn't marked leader-only in the contract. The UI shows it only to the leader.
6. **Hackathon form** validates end ≥ start and deadline ≤ start on the client. The contract doesn't
   specify server-side date rules.
7. **Silent polling**: `GET /notifications/unread-count` is sent with a custom axios config flag
   `silent: true`, so a backend outage doesn't toast every 30 seconds. A 401 still logs the user out.
8. The mock follows backend/CLAUDE.md business rules: one team per hackathon (409), team full (400),
   duplicate pending (409), leader-only actions (403), leader can't leave (400), accepting
   auto-rejects the user's other pending requests in that hackathon, and notifications on
   invite/join/accept/reject.

## Viva-friendly module explanations
- **config.js**: one switch (`USE_MOCK`) decides whether data comes from mocks or the real API.
- **api/axios.js**: the single Axios instance. The request interceptor adds `Authorization: Bearer <token>`.
  The response interceptor sends every error to `handleApiError`.
- **api/errorHandler.js**: a 401 clears the session and redirects to `/login`. Any other error shows a
  toast with the backend's `message`. Mock errors go through the same function, so both modes behave the same.
- **services/**: the only place that talks to the backend. Each function either calls the mock
  handler (after a 300ms delay) or makes the Axios call, and returns `response.data`. Pages
  never import Axios, which is why switching modes needs zero UI changes.
- **mocks/**: a small fake backend. `seed.js` holds rows (ids, not nested objects) like a database.
  `db.js` stores them (persisted to localStorage) and *serializes* them into the exact contract
  shapes (e.g. a User never includes the password). `handlers.js` implements each endpoint
  with the real business rules. `mockCall.js` adds latency and turns thrown errors into
  Axios-shaped errors (`error.response.data = {status, message, timestamp}`).
- **Matching (mocks/matching.js)**: rule-based and deterministic, no AI. Score out of 100:
  skill = share of the team's *missing* skills the candidate has × 50; role = 25 if they prefer
  an uncovered role; experience 15/10/5; availability 10/6/3. Sorted by score, then name.
- **AuthContext**: holds `{token, user}`, mirrored to localStorage so a refresh keeps you
  logged in. It exposes `login`, `register`, `logout` and `updateUser`.
- **ProtectedRoute / AdminRoute**: route guards. They redirect to `/login`, or to `/` for non-admins.
- **useFetch hook**: gives every page the same loading, error (with retry) and data states.
- **Team page**: computes the viewer's role (leader / member / outsider) and shows only the
  allowed actions. The Skill Gap panel colours required skills green (covered) or red (missing),
  from `GET /teams/{id}/skill-gap`. Matches load lazily when the leader opens the tab.
- **NotificationBell**: `setInterval` polls the unread count every 30s. Opening the dropdown
  loads the list (newest first), and "Mark read" updates the item and the badge locally.
