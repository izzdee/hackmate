# HackMate

A hackathon team formation and skill-matching platform. Students build skill-based profiles,
browse hackathons, form teams, and find teammates through invites and join requests.
Candidates are ranked with a rule-based, deterministic compatibility score, and each team's
skill gaps are shown. There is no AI/ML in the app.

- `backend/`: Spring Boot 3 REST API (Java 17, PostgreSQL, JWT). See [backend/NOTES.md](backend/NOTES.md).
- `frontend/`: React + Vite app. See [frontend/NOTES.md](frontend/NOTES.md).
- `docs/API_CONTRACT.md`: the API both sides follow.

## Run it locally (Windows)
Requires Java 17+, Node.js, and Docker Desktop.

1. **Database:** create the PostgreSQL container once (port 5433, so it doesn't clash with a
   local PostgreSQL on 5432):
   ```powershell
   powershell -ExecutionPolicy Bypass -File backend\reset-db.ps1
   ```
2. **Backend** (http://localhost:8080/api):
   ```powershell
   powershell -ExecutionPolicy Bypass -File backend\start-backend.ps1
   ```
   On first start with an empty database, it loads demo data.
3. **Frontend** (http://localhost:5173), in a second terminal:
   ```powershell
   cd frontend; npm install; npm run dev
   ```

Demo logins: `admin@hackmate.com` / `admin123`, or a student such as `aryan@hackmate.com` / `password123`.

## Scripts (`backend/`)
| Script | What it does |
|---|---|
| `start-backend.ps1` | Starts the backend against the Docker database `hackmate-db` on port 5433. |
| `reset-db.ps1` | Stops a running backend, deletes the `hackmate-db` container and its `hackmate-db-data` volume, and recreates an empty database. The next backend start reloads fresh demo data. |

`-ExecutionPolicy Bypass` is needed because Windows blocks unsigned scripts by default.
