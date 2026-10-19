import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../api/authStorage';

const AuthContext = createContext(null);

// Holds the logged-in user + token. Mirrors localStorage so a refresh keeps you logged in.
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth()); // { token, user } | null

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password }); // { token, user }
    setStoredAuth(data);
    setAuth(data);
    return data.user;
  }, []);

  // Contract: register returns the User (no token), so we log in right after.
  const register = useCallback(
    async (name, email, password) => {
      await authService.register({ name, email, password });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
  }, []);

  // Call after the profile is edited so the navbar etc. show fresh data
  const updateUser = useCallback((user) => {
    setAuth((prev) => {
      const next = { ...prev, user };
      setStoredAuth(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      isAdmin: auth?.user?.role === 'ADMIN',
      login,
      register,
      logout,
      updateUser,
    }),
    [auth, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
