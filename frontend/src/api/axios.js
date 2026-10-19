import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from './authStorage';
import { handleApiError } from './errorHandler';

// The ONLY Axios instance in the app. Pages never import this — services do.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central error handling (401 → logout, otherwise toast). The error is re-thrown
// so the calling page can still react (e.g. stop a spinner, show an error state).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
