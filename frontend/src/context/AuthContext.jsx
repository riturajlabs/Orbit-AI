import { createContext, useEffect, useMemo, useState } from 'react';
import { authApi, clearAuthToken, loadStoredAuthToken, parseApiError, setAuthToken } from '../services/api';

export const AuthContext = createContext(null);

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage.getItem('ai-chatbot-user');
  if (!rawUser) return null;
  try { return JSON.parse(rawUser); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => loadStoredAuthToken());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      window.localStorage.setItem('ai-chatbot-user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('ai-chatbot-user');
    }

    if (token) {
      window.localStorage.setItem('ai-chatbot-token', token);
      setAuthToken(token);
    } else {
      clearAuthToken();
    }
  }, [token, user]);

  const login = async (credentials) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login(credentials);
      const authData = response.data?.data || {};
      setUser(authData.user || null);
      setToken(authData.token || null);
      return response.data;
    } catch (requestError) {
      const message = parseApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.register(payload);
      const authData = response.data?.data || {};
      setUser(authData.user || null);
      setToken(authData.token || null);
      return response.data;
    } catch (requestError) {
      const message = parseApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError('');
    try { await authApi.logout(); } catch { } 
    finally {
      clearAuthToken();
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const clearAuthError = () => setError('');

  // 👇 NAYA FUNCTION: Profile update hone par frontend context ko update karne ke liye
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      error,
      login,
      register,
      logout,
      clearAuthError,
      updateUser, // 👈 Isko yahan expose kar diya
    }),
    [clearAuthError, error, isLoading, logout, login, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}