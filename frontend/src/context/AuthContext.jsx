import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healthplus_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('healthplus_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user session:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('healthplus_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('healthplus_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };


  // Quick 1-click Demo Switchers for convenience
  const quickLoginAsAlex = () => login('alex@healthplus.com', 'password123');
  const quickLoginAsAdmin = () => login('admin@healthplus.com', 'admin123');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        quickLoginAsAlex,
        quickLoginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
