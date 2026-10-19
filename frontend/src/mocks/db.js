// In-memory "database" for mock mode.
// State is persisted to localStorage so mock changes survive a page refresh.
// Call resetMockDb() (or clear localStorage) to go back to the seed data.
import {
  seedSkills, seedUsers, seedHackathons, seedTeams, seedRequests, seedNotifications,
} from './seed';

const STORAGE_KEY = 'hackmate_mock_db_v2';

function freshDb() {
  // structuredClone so mutations never touch the seed arrays
  return structuredClone({
    skills: seedSkills,
    users: seedUsers,
    hackathons: seedHackathons,
    teams: seedTeams,
    requests: seedRequests,
    notifications: seedNotifications,
  });
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted or unavailable storage – fall back to seed data
  }
  return freshDb();
}

export const db = loadDb();

export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full / disabled – mock still works for this session
  }
}

export function resetMockDb() {
  Object.assign(db, freshDb());
  saveDb();
}

// Next id for a table = max existing id + 1 (like an auto-increment column)
export function nextId(table) {
  return db[table].reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

// Current server time in the contract's format: "2026-10-19T10:00:00"
export function nowIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ---------- Lookups ----------
export const findSkill = (id) => db.skills.find((s) => s.id === Number(id));
export const findUser = (id) => db.users.find((u) => u.id === Number(id));
export const findHackathon = (id) => db.hackathons.find((h) => h.id === Number(id));
export const findTeam = (id) => db.teams.find((t) => t.id === Number(id));
export const findRequest = (id) => db.requests.find((r) => r.id === Number(id));

// ---------- Serializers: DB row → exact API_CONTRACT JSON shape ----------

// Skill: { id, name }
export const toSkill = (s) => ({ id: s.id, name: s.name });

// User: never includes password
export function toUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    bio: u.bio,
    role: u.role,
    experienceLevel: u.experienceLevel,
    preferredRoles: [...u.preferredRoles],
    availability: u.availability,
    skills: u.skillIds.map(findSkill).filter(Boolean).map(toSkill),
  };
}

// Hackathon
export const toHackathon = (h) => ({ ...h });

// Team: nested hackathon/leader summaries + full member Users
export function toTeam(t) {
  const hackathon = findHackathon(t.hackathonId);
  const leader = findUser(t.leaderId);
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    hackathon: { id: hackathon.id, title: hackathon.title },
    leader: { id: leader.id, name: leader.name },
    members: t.memberIds.map(findUser).filter(Boolean).map(toUser),
    requiredSkills: t.requiredSkillIds.map(findSkill).filter(Boolean).map(toSkill),
    requiredRoles: [...t.requiredRoles],
    maxTeamSize: hackathon.maxTeamSize,
  };
}

// TeamRequest
export function toRequest(r) {
  const team = findTeam(r.teamId);
  const user = findUser(r.userId);
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    createdAt: r.createdAt,
    team: { id: team.id, name: team.name },
    user: { id: user.id, name: user.name },
  };
}

// Notification (userId is internal, not part of the contract)
export const toNotification = (n) => ({
  id: n.id, message: n.message, isRead: n.isRead, createdAt: n.createdAt,
});
