import api from '../api/axios';
import { USE_MOCK } from '../config';
import { mockCall } from '../mocks/mockCall';
import * as mock from '../mocks/handlers';

// GET /notifications → Notification[] (newest first)
export const getNotifications = () =>
  USE_MOCK ? mockCall(mock.getNotifications) : api.get('/notifications').then((r) => r.data);

// GET /notifications/unread-count → { count }
export const getUnreadCount = () =>
  USE_MOCK ? mockCall(mock.getUnreadCount) : api.get('/notifications/unread-count').then((r) => r.data);

// PUT /notifications/{id}/read → Notification
export const markAsRead = (id) =>
  USE_MOCK ? mockCall(() => mock.markNotificationRead(id)) : api.put(`/notifications/${id}/read`).then((r) => r.data);
