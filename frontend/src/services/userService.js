import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// GET /users/me → User
export const getMe = () =>
  USE_MOCK ? mockCall(mock.getMe) : api.get('/users/me').then((r) => r.data);

// PUT /users/me  {name, bio, experienceLevel, preferredRoles[], availability, skillIds[]} → User
export const updateMe = (body) =>
  USE_MOCK ? mockCall(() => mock.updateMe(body)) : api.put('/users/me', body).then((r) => r.data);

// GET /users/{id} → User
export const getUser = (id) =>
  USE_MOCK ? mockCall(() => mock.getUser(id)) : api.get(`/users/${id}`).then((r) => r.data);

// GET /users/search?skill=&role= (both optional) → User[]
export const searchUsers = ({ skill, role } = {}) => {
  const params = {};
  if (skill) params.skill = skill;
  if (role) params.role = role;
  return USE_MOCK
    ? mockCall(() => mock.searchUsers(params))
    : api.get('/users/search', { params }).then((r) => r.data);
};
