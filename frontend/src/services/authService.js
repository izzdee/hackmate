import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// POST /auth/register → User
export const register = (body) =>
  USE_MOCK
    ? mockCall(() => mock.register(body), { url: '/auth/register' })
    : api.post('/auth/register', body).then((r) => r.data);

// POST /auth/login → { token, user }
export const login = (body) =>
  USE_MOCK
    ? mockCall(() => mock.login(body), { url: '/auth/login' })
    : api.post('/auth/login', body).then((r) => r.data);
