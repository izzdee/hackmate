// Mock backend: one function per endpoint in docs/API_CONTRACT.md.
// Each function applies the same business rules the real backend should
// (permissions, team full, duplicates...) and returns exactly the contract's JSON.
// Errors are thrown with ApiError(status, message) – see mockCall.js.
import {
  db, saveDb, nextId, nowIso, findUser, findHackathon, findTeam, findRequest, findSkill,
  toUser, toSkill, toHackathon, toTeam, toRequest, toNotification,
} from './db';
import { missingSkillIds, scoreCandidate } from './matching';
import { getToken } from '../api/authStorage';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ---------- helpers ----------

// Mock tokens look like "mock-token-<userId>"
function currentUser() {
  const token = getToken();
  const id = token?.startsWith('mock-token-') ? Number(token.slice('mock-token-'.length)) : null;
  const user = id && findUser(id);
  if (!user) throw new ApiError(401, 'Not logged in');
  return user;
}

function requireAdmin() {
  const me = currentUser();
  if (me.role !== 'ADMIN') throw new ApiError(403, 'Admin access required');
  return me;
}

function getTeamOr404(id) {
  const team = findTeam(id);
  if (!team) throw new ApiError(404, 'Team not found');
  return team;
}

const teamMembers = (team) => team.memberIds.map(findUser).filter(Boolean);
const isFull = (team) => team.memberIds.length >= findHackathon(team.hackathonId).maxTeamSize;

// Is this user already in some team for the given hackathon?
const userTeamInHackathon = (userId, hackathonId) =>
  db.teams.find((t) => t.hackathonId === hackathonId && t.memberIds.includes(userId));

function notify(userId, message) {
  db.notifications.push({ id: nextId('notifications'), userId, message, isRead: false, createdAt: nowIso() });
}

function validateSkillIds(ids = []) {
  const unique = [...new Set(ids.map(Number))];
  unique.forEach((id) => {
    if (!findSkill(id)) throw new ApiError(400, `Unknown skill id ${id}`);
  });
  return unique;
}

// ---------- Auth ----------

export function register({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password) throw new ApiError(400, 'Name, email and password are required');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new ApiError(409, 'Email is already registered');
  }
  const user = {
    id: nextId('users'), name: name.trim(), email: email.trim().toLowerCase(), password,
    bio: '', role: 'STUDENT', experienceLevel: 'BEGINNER', preferredRoles: [],
    availability: 'FULL_TIME', skillIds: [],
  };
  db.users.push(user);
  saveDb();
  return toUser(user);
}

export function login({ email, password }) {
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!user || user.password !== password) throw new ApiError(401, 'Invalid email or password');
  return { token: `mock-token-${user.id}`, user: toUser(user) };
}

// ---------- Users & skills ----------

export const getMe = () => toUser(currentUser());

export function updateMe({ name, bio, experienceLevel, preferredRoles, availability, skillIds }) {
  const me = currentUser();
  if (!name?.trim()) throw new ApiError(400, 'Name is required');
  Object.assign(me, {
    name: name.trim(),
    bio: bio ?? '',
    experienceLevel,
    preferredRoles: [...new Set(preferredRoles || [])],
    availability,
    skillIds: validateSkillIds(skillIds),
  });
  saveDb();
  return toUser(me);
}

export function getUser(id) {
  currentUser();
  const user = findUser(id);
  if (!user) throw new ApiError(404, 'User not found');
  return toUser(user);
}

// Both filters optional. Only students are returned, and never the caller.
export function searchUsers({ skill, role } = {}) {
  const me = currentUser();
  const skillQuery = skill?.trim().toLowerCase();
  return db.users
    .filter((u) => u.role === 'STUDENT' && u.id !== me.id)
    .filter((u) => !role || u.preferredRoles.includes(role))
    .filter((u) => !skillQuery || u.skillIds.some((id) => findSkill(id)?.name.toLowerCase() === skillQuery))
    .map(toUser);
}

export function getSkills() {
  currentUser();
  return db.skills.map(toSkill).sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- Hackathons ----------

export function getHackathons() {
  currentUser();
  return [...db.hackathons].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(toHackathon);
}

export function getHackathon(id) {
  currentUser();
  const h = findHackathon(id);
  if (!h) throw new ApiError(404, 'Hackathon not found');
  return toHackathon(h);
}

function validateHackathon(body) {
  const required = ['title', 'organizer', 'startDate', 'endDate', 'registrationDeadline', 'mode'];
  required.forEach((f) => {
    if (!body[f] || String(body[f]).trim() === '') throw new ApiError(400, `${f} is required`);
  });
  if (body.endDate < body.startDate) throw new ApiError(400, 'End date must be on or after start date');
  if (body.registrationDeadline > body.startDate) throw new ApiError(400, 'Registration deadline must be before the start date');
  const size = Number(body.maxTeamSize);
  if (!Number.isInteger(size) || size < 1 || size > 10) throw new ApiError(400, 'Max team size must be between 1 and 10');
  return {
    title: body.title.trim(), description: body.description ?? '', organizer: body.organizer.trim(),
    startDate: body.startDate, endDate: body.endDate, registrationDeadline: body.registrationDeadline,
    maxTeamSize: size, mode: body.mode,
  };
}

export function createHackathon(body) {
  requireAdmin();
  const h = { id: nextId('hackathons'), ...validateHackathon(body) };
  db.hackathons.push(h);
  saveDb();
  return toHackathon(h);
}

export function updateHackathon(id, body) {
  requireAdmin();
  const h = findHackathon(id);
  if (!h) throw new ApiError(404, 'Hackathon not found');
  Object.assign(h, validateHackathon(body));
  saveDb();
  return toHackathon(h);
}

export function deleteHackathon(id) {
  requireAdmin();
  const h = findHackathon(id);
  if (!h) throw new ApiError(404, 'Hackathon not found');
  // cascade: remove its teams and their requests
  const teamIds = db.teams.filter((t) => t.hackathonId === h.id).map((t) => t.id);
  db.requests = db.requests.filter((r) => !teamIds.includes(r.teamId));
  db.teams = db.teams.filter((t) => t.hackathonId !== h.id);
  db.hackathons = db.hackathons.filter((x) => x.id !== h.id);
  saveDb();
  return null; // 204
}

// ---------- Teams ----------

function validateTeamBody(body) {
  if (!body.name?.trim()) throw new ApiError(400, 'Team name is required');
  return {
    name: body.name.trim(),
    description: body.description ?? '',
    requiredSkillIds: validateSkillIds(body.requiredSkillIds),
    requiredRoles: [...new Set(body.requiredRoles || [])],
  };
}

export function createTeam(body) {
  const me = currentUser();
  const hackathon = findHackathon(body.hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (userTeamInHackathon(me.id, hackathon.id)) {
    throw new ApiError(409, 'You are already in a team for this hackathon');
  }
  const team = {
    id: nextId('teams'), hackathonId: hackathon.id, leaderId: me.id, memberIds: [me.id],
    ...validateTeamBody(body),
  };
  db.teams.push(team);
  saveDb();
  return toTeam(team);
}

export function getTeams({ hackathonId } = {}) {
  currentUser();
  return db.teams
    .filter((t) => !hackathonId || t.hackathonId === Number(hackathonId))
    .map(toTeam);
}

export function getMyTeams() {
  const me = currentUser();
  return db.teams.filter((t) => t.memberIds.includes(me.id)).map(toTeam);
}

export function getTeam(id) {
  currentUser();
  return toTeam(getTeamOr404(id));
}

export function updateTeam(id, body) {
  const me = currentUser();
  const team = getTeamOr404(id);
  if (team.leaderId !== me.id) throw new ApiError(403, 'Only the team leader can edit the team');
  Object.assign(team, validateTeamBody(body));
  saveDb();
  return toTeam(team);
}

export function deleteTeam(id) {
  const me = currentUser();
  const team = getTeamOr404(id);
  if (team.leaderId !== me.id) throw new ApiError(403, 'Only the team leader can delete the team');
  db.requests = db.requests.filter((r) => r.teamId !== team.id);
  db.teams = db.teams.filter((t) => t.id !== team.id);
  saveDb();
  return null; // 204
}

export function leaveTeam(id) {
  const me = currentUser();
  const team = getTeamOr404(id);
  if (!team.memberIds.includes(me.id)) throw new ApiError(400, 'You are not a member of this team');
  if (team.leaderId === me.id) throw new ApiError(400, 'The leader cannot leave the team. Delete the team instead.');
  team.memberIds = team.memberIds.filter((uid) => uid !== me.id);
  saveDb();
  return null; // 204
}

export function getSkillGap(id) {
  currentUser();
  const team = getTeamOr404(id);
  return missingSkillIds(team, teamMembers(team)).map(findSkill).map(toSkill);
}

// Candidates = students not already in a team for this hackathon, ranked by score desc
export function getMatches(id) {
  currentUser();
  const team = getTeamOr404(id);
  const members = teamMembers(team);
  return db.users
    .filter((u) => u.role === 'STUDENT' && !userTeamInHackathon(u.id, team.hackathonId))
    .map((u) => ({ user: toUser(u), ...scoreCandidate(u, team, members) }))
    .sort((a, b) => b.score - a.score || a.user.name.localeCompare(b.user.name));
}

// ---------- Requests ----------

function assertCanAddToTeam(team, userId) {
  if (isFull(team)) throw new ApiError(400, 'Team is full');
  if (userTeamInHackathon(userId, team.hackathonId)) {
    throw new ApiError(409, 'User is already in a team for this hackathon');
  }
}

function assertNoPending(teamId, userId) {
  const pending = db.requests.some((r) => r.teamId === teamId && r.userId === userId && r.status === 'PENDING');
  if (pending) throw new ApiError(409, 'A request is already pending between this user and team');
}

export function invite(teamId, userId) {
  const me = currentUser();
  const team = getTeamOr404(teamId);
  if (team.leaderId !== me.id) throw new ApiError(403, 'Only the team leader can invite');
  const user = findUser(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role !== 'STUDENT') throw new ApiError(400, 'Only students can be invited');
  assertCanAddToTeam(team, user.id);
  assertNoPending(team.id, user.id);
  const req = { id: nextId('requests'), type: 'INVITE', status: 'PENDING', createdAt: nowIso(), teamId: team.id, userId: user.id };
  db.requests.push(req);
  notify(user.id, `${me.name} invited you to join ${team.name}`);
  saveDb();
  return toRequest(req);
}

export function join(teamId) {
  const me = currentUser();
  const team = getTeamOr404(teamId);
  if (team.memberIds.includes(me.id)) throw new ApiError(409, 'You are already a member of this team');
  assertCanAddToTeam(team, me.id);
  assertNoPending(team.id, me.id);
  const req = { id: nextId('requests'), type: 'JOIN_REQUEST', status: 'PENDING', createdAt: nowIso(), teamId: team.id, userId: me.id };
  db.requests.push(req);
  notify(team.leaderId, `${me.name} requested to join ${team.name}`);
  saveDb();
  return toRequest(req);
}

export function getMyRequests() {
  const me = currentUser();
  const leads = (r) => findTeam(r.teamId)?.leaderId === me.id;
  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);
  const incoming = db.requests.filter(
    (r) => (r.type === 'INVITE' && r.userId === me.id) || (r.type === 'JOIN_REQUEST' && leads(r))
  );
  const outgoing = db.requests.filter(
    (r) => (r.type === 'JOIN_REQUEST' && r.userId === me.id) || (r.type === 'INVITE' && leads(r))
  );
  return {
    incoming: incoming.sort(newestFirst).map(toRequest),
    outgoing: outgoing.sort(newestFirst).map(toRequest),
  };
}

// Who may answer a request: the invited user (INVITE) or the team leader (JOIN_REQUEST)
function getAnswerableRequest(id) {
  const me = currentUser();
  const req = findRequest(id);
  if (!req) throw new ApiError(404, 'Request not found');
  const team = getTeamOr404(req.teamId);
  const allowed = req.type === 'INVITE' ? req.userId === me.id : team.leaderId === me.id;
  if (!allowed) throw new ApiError(403, 'You cannot respond to this request');
  if (req.status !== 'PENDING') throw new ApiError(400, 'Request has already been answered');
  return { me, req, team };
}

export function acceptRequest(id) {
  const { me, req, team } = getAnswerableRequest(id);
  assertCanAddToTeam(team, req.userId);
  req.status = 'ACCEPTED';
  team.memberIds.push(req.userId);
  // The user is now in a team for this hackathon → their other pending requests for it are void
  db.requests
    .filter((r) => r.id !== req.id && r.userId === req.userId && r.status === 'PENDING'
      && findTeam(r.teamId)?.hackathonId === team.hackathonId)
    .forEach((r) => { r.status = 'REJECTED'; });
  if (req.type === 'INVITE') {
    notify(team.leaderId, `${me.name} accepted your invite to join ${team.name}`);
  } else {
    notify(req.userId, `${me.name} accepted your request to join ${team.name}`);
  }
  saveDb();
  return toRequest(req);
}

export function rejectRequest(id) {
  const { me, req, team } = getAnswerableRequest(id);
  req.status = 'REJECTED';
  if (req.type === 'INVITE') {
    notify(team.leaderId, `${me.name} declined your invite to join ${team.name}`);
  } else {
    notify(req.userId, `${me.name} rejected your request to join ${team.name}`);
  }
  saveDb();
  return toRequest(req);
}

// ---------- Notifications ----------

const myNotifications = (me) => db.notifications.filter((n) => n.userId === me.id);

export function getNotifications() {
  const me = currentUser();
  return myNotifications(me)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
    .map(toNotification);
}

export function getUnreadCount() {
  const me = currentUser();
  return { count: myNotifications(me).filter((n) => !n.isRead).length };
}

export function markNotificationRead(id) {
  const me = currentUser();
  const n = myNotifications(me).find((x) => x.id === Number(id));
  if (!n) throw new ApiError(404, 'Notification not found');
  n.isRead = true;
  saveDb();
  return toNotification(n);
}
