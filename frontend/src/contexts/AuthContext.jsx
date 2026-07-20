import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { setAccessToken } from '../services/api.client';
const AuthContext = createContext({});
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session
  useEffect(() => {
    const restore = async () => {
      try {
        const data = await authService.refresh();
        setAccessToken(data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setAccessToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };
  const register = async registerData => {
    const data = await authService.register(registerData);
    setAccessToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };
  const logout = async () => {
    try {
      setAccessToken(null);
      await authService.logout();
    } catch {}
    setToken(null);
    setUser(null);
  };
  const refreshUser = async () => {
    try {
      const data = await authService.getMe(token);
      setUser(data);
    } catch {}
  };
  return <AuthContext.Provider value={{
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);