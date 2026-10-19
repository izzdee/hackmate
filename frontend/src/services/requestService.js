import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// POST /teams/{id}/invite/{userId} (leader) → TeamRequest
export const inviteUser = (teamId, userId) =>
  USE_MOCK
    ? mockCall(() => mock.invite(teamId, userId))
    : api.post(`/teams/${teamId}/invite/${userId}`).then((r) => r.data);

// POST /teams/{id}/join → TeamRequest
export const requestToJoin = (teamId) =>
  USE_MOCK ? mockCall(() => mock.join(teamId)) : api.post(`/teams/${teamId}/join`).then((r) => r.data);

// GET /requests/me → { incoming: TeamRequest[], outgoing: TeamRequest[] }
export const getMyRequests = () =>
  USE_MOCK ? mockCall(mock.getMyRequests) : api.get('/requests/me').then((r) => r.data);

// PUT /requests/{id}/accept → TeamRequest
export const acceptRequest = (id) =>
  USE_MOCK ? mockCall(() => mock.acceptRequest(id)) : api.put(`/requests/${id}/accept`).then((r) => r.data);

// PUT /requests/{id}/reject → TeamRequest
export const rejectRequest = (id) =>
  USE_MOCK ? mockCall(() => mock.rejectRequest(id)) : api.put(`/requests/${id}/reject`).then((r) => r.data);
