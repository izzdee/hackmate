import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// GET /hackathons → Hackathon[]
export const getHackathons = () =>
  USE_MOCK ? mockCall(mock.getHackathons) : api.get('/hackathons').then((r) => r.data);

// GET /hackathons/{id} → Hackathon
export const getHackathon = (id) =>
  USE_MOCK ? mockCall(() => mock.getHackathon(id)) : api.get(`/hackathons/${id}`).then((r) => r.data);

// POST /hackathons (ADMIN) → Hackathon
export const createHackathon = (body) =>
  USE_MOCK ? mockCall(() => mock.createHackathon(body)) : api.post('/hackathons', body).then((r) => r.data);

// PUT /hackathons/{id} (ADMIN) → Hackathon
export const updateHackathon = (id, body) =>
  USE_MOCK
    ? mockCall(() => mock.updateHackathon(id, body))
    : api.put(`/hackathons/${id}`, body).then((r) => r.data);

// DELETE /hackathons/{id} (ADMIN) → 204
export const deleteHackathon = (id) =>
  USE_MOCK ? mockCall(() => mock.deleteHackathon(id)) : api.delete(`/hackathons/${id}`).then(() => null);
