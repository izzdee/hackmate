# HackMate API Contract

Base URL: `http://localhost:8080/api`
All requests/responses are JSON. Every endpoint except `/auth/**` needs
`Authorization: Bearer <token>`.

## Enums
- `role`: `STUDENT` | `ADMIN`
- `experienceLevel`: `BEGINNER` | `INTERMEDIATE` | `ADVANCED`
- `preferredRoles` / `requiredRoles` items: `FRONTEND` | `BACKEND` | `FULLSTACK` | `UI_UX` | `ML` | `DEVOPS` | `MOBILE`
- `availability`: `FULL_TIME` | `PART_TIME` | `WEEKENDS`
- `mode`: `ONLINE` | `OFFLINE`
- request `type`: `INVITE` | `JOIN_REQUEST`
- request `status`: `PENDING` | `ACCEPTED` | `REJECTED`

## JSON shapes
```jsonc
// Skill
{ "id": 1, "name": "React" }

// User (never includes password)
{
  "id": 1, "name": "Aryan", "email": "aryan@example.com", "bio": "...",
  "role": "STUDENT", "experienceLevel": "INTERMEDIATE",
  "preferredRoles": ["BACKEND"], "availability": "FULL_TIME",
  "skills": [{ "id": 1, "name": "Java" }]
}

// Hackathon
{
  "id": 1, "title": "Smart India Hackathon", "description": "...", "organizer": "...",
  "startDate": "2026-11-20", "endDate": "2026-11-22", "registrationDeadline": "2026-11-10",
  "maxTeamSize": 4, "mode": "OFFLINE"
}

// Team
{
  "id": 1, "name": "Code Crusaders", "description": "...",
  "hackathon": { "id": 1, "title": "Smart India Hackathon" },
  "leader": { "id": 1, "name": "Aryan" },
  "members": [ /* User */ ],
  "requiredSkills": [{ "id": 2, "name": "React" }],
  "requiredRoles": ["FRONTEND", "UI_UX"],
  "maxTeamSize": 4
}

// MatchResult
{
  "user": { /* User */ },
  "score": 82.5,
  "breakdown": { "skill": 37.5, "role": 25, "experience": 10, "availability": 10 }
}

// TeamRequest
{
  "id": 1, "type": "INVITE", "status": "PENDING", "createdAt": "2026-10-19T10:00:00",
  "team": { "id": 1, "name": "Code Crusaders" },
  "user": { "id": 3, "name": "Deeksha" }
}

// Notification
{ "id": 1, "message": "Aryan invited you to join Code Crusaders", "isRead": false, "createdAt": "2026-10-19T10:00:00" }

// Error (every 4xx/5xx)
{ "status": 400, "message": "Team is full", "timestamp": "2026-10-19T10:00:00" }
```

## Endpoints

### Auth (public)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{name, email, password}` | `User` (201) |
| POST | `/auth/login` | `{email, password}` | `{token, user}` |

### Users & skills
| Method | Path | Body / Query | Response |
|---|---|---|---|
| GET | `/users/me` | | `User` |
| PUT | `/users/me` | `{name, bio, experienceLevel, preferredRoles[], availability, skillIds[]}` | `User` |
| GET | `/users/{id}` | | `User` |
| GET | `/users/search` | `?skill=React&role=FRONTEND` (both optional) | `User[]` |
| GET | `/skills` | | `Skill[]` |

### Hackathons
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/hackathons` | | `Hackathon[]` |
| GET | `/hackathons/{id}` | | `Hackathon` |
| POST | `/hackathons` (ADMIN) | Hackathon without id | `Hackathon` (201) |
| PUT | `/hackathons/{id}` (ADMIN) | Hackathon without id | `Hackathon` |
| DELETE | `/hackathons/{id}` (ADMIN) | | 204 |

### Teams
| Method | Path | Body / Query | Response |
|---|---|---|---|
| POST | `/teams` | `{name, description, hackathonId, requiredSkillIds[], requiredRoles[]}` | `Team` (201) |
| GET | `/teams` | `?hackathonId=1` | `Team[]` |
| GET | `/teams/my` | | `Team[]` |
| GET | `/teams/{id}` | | `Team` |
| PUT | `/teams/{id}` (leader) | same as POST | `Team` |
| DELETE | `/teams/{id}` (leader) | | 204 |
| POST | `/teams/{id}/leave` | | 204 |
| GET | `/teams/{id}/skill-gap` | | `Skill[]` |
| GET | `/teams/{id}/matches` | | `MatchResult[]` (sorted by score desc) |

### Requests
| Method | Path | Response |
|---|---|---|
| POST | `/teams/{id}/invite/{userId}` (leader) | `TeamRequest` (201) |
| POST | `/teams/{id}/join` | `TeamRequest` (201) |
| GET | `/requests/me` | `{ "incoming": TeamRequest[], "outgoing": TeamRequest[] }` |
| PUT | `/requests/{id}/accept` | `TeamRequest` |
| PUT | `/requests/{id}/reject` | `TeamRequest` |

"incoming" = invites sent to me + join requests to teams I lead.
"outgoing" = join requests I sent + invites I sent as leader.

### Notifications
| Method | Path | Response |
|---|---|---|
| GET | `/notifications` | `Notification[]` (newest first) |
| GET | `/notifications/unread-count` | `{ "count": 3 }` |
| PUT | `/notifications/{id}/read` | `Notification` |

## Status codes
200 OK · 201 Created · 204 No Content · 400 validation/business rule · 401 not logged in /
bad token · 403 not allowed (not leader / not admin) · 404 not found · 409 duplicate
(email taken, request already pending, already in a team for this hackathon)
