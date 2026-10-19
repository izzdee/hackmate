// Single place that reads/writes the logged-in session in localStorage.
// Shape stored: { token, user }  (exactly what POST /auth/login returns)
const KEY = 'hackmate_auth';

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(KEY);
}

export const getToken = () => getStoredAuth()?.token || null;
