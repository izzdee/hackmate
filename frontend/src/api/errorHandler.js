import toast from 'react-hot-toast';
import { clearStoredAuth } from './authStorage';

// Shared error handling used by BOTH the Axios response interceptor and mock mode,
// so the app behaves identically whether USE_MOCK is true or false.
//   401 → clear auth and send the user to /login
//   anything else → toast with the backend's error message
export function handleApiError(error) {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    (error?.request && !error?.response ? 'Cannot reach the server. Is the backend running?' : error?.message) ||
    'Something went wrong';

  const url = error?.config?.url || '';
  const isAuthCall = url.includes('/auth/');

  if (status === 401 && !isAuthCall) {
    clearStoredAuth();
    toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
    if (window.location.pathname !== '/login') window.location.assign('/login');
    return;
  }
  // Background calls (e.g. notification polling) pass { silent: true } to skip toasts
  if (error?.config?.silent) return;
  // id = message, so the same error shown twice at once collapses into one toast
  toast.error(message, { id: message });
}

// Pull a readable message out of any error (for inline error states)
export function errorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}
