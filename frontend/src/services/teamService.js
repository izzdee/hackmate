import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// POST /teams  {name, description, hackathonId, requiredSkillIds[], requiredRoles[]} → Team
export const createTeam = (body) =>
  USE_MOCK ? mockCall(() => mock.createTeam(body)) : api.post('/teams', body).then((r) => r.data);

// GET /teams?hackathonId= → Team[]
export const getTeams = (hackathonId) => {
  const params = hackathonId ? { hackathonId } : {};
  return USE_MOCK ? mockCall(() => mock.getTeams(params)) : api.get('/teams', { params }).then((r) => r.data);
};

// GET /teams/my → Team[]
export const getMyTeams = () =>
  USE_MOCK ? mockCall(mock.getMyTeams) : api.get('/teams/my').then((r) => r.data);

// GET /teams/{id} → Team
export const getTeam = (id) =>
  USE_MOCK ? mockCall(() => mock.getTeam(id)) : api.get(`/teams/${id}`).then((r) => r.data);

// PUT /teams/{id} (leader) → Team
export const updateTeam = (id, body) =>
  USE_MOCK ? mockCall(() => mock.updateTeam(id, body)) : api.put(`/teams/${id}`, body).then((r) => r.data);

// DELETE /teams/{id} (leader) → 204
export const deleteTeam = (id) =>
  USE_MOCK ? mockCall(() => mock.deleteTeam(id)) : api.delete(`/teams/${id}`).then(() => null);

// POST /teams/{id}/leave → 204
export const leaveTeam = (id) =>
  USE_MOCK ? mockCall(() => mock.leaveTeam(id)) : api.post(`/teams/${id}/leave`).then(() => null);

// GET /teams/{id}/skill-gap → Skill[]
export const getSkillGap = (id) =>
  USE_MOCK ? mockCall(() => mock.getSkillGap(id)) : api.get(`/teams/${id}/skill-gap`).then((r) => r.data);

// GET /teams/{id}/matches → MatchResult[] (sorted by score desc)
export const getMatches = (id) =>
  USE_MOCK ? mockCall(() => mock.getMatches(id)) : api.get(`/teams/${id}/matches`).then((r) => r.data);
