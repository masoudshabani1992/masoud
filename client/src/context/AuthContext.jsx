import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('boxfactory_token'));
  const [loading, setLoading] = useState(true);

  const handleLogin = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res && res.token) {
        localStorage.setItem('boxfactory_token', res.token);
        setToken(res.token);
        setCurrentUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Login error', err);
      throw err;
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      const res = await api.demoLogin(role);
      if (res && res.token) {
        localStorage.setItem('boxfactory_token', res.token);
        setToken(res.token);
        setCurrentUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Demo login error', err);
      throw err;
    }
  };

  useEffect(() => {
    async function initAuth() {
      const saved = localStorage.getItem('boxfactory_token');
      if (saved) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
            setToken(saved);
          } else {
            localStorage.removeItem('boxfactory_token');
            setToken(null);
            setCurrentUser(null);
          }
        } catch (err) {
          localStorage.removeItem('boxfactory_token');
          setToken(null);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('boxfactory_token');
    setToken(null);
    setCurrentUser(null);
  };

  const permissions = currentUser?.permissions || {};

  const hasPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ceo') return true;
    if (currentUser.permissions && currentUser.permissions[permissionKey] !== undefined) {
      return Boolean(currentUser.permissions[permissionKey]);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'sales',
        permissions,
        hasPermission,
        token,
        loading,
        login: handleLogin,
        switchRole: handleDemoLogin,
        logout: handleLogout
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
