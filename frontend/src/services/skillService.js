import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// GET /skills → Skill[]
export const getSkills = () =>
  USE_MOCK ? mockCall(mock.getSkills) : api.get('/skills').then((r) => r.data);
