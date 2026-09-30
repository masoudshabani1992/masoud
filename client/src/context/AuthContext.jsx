import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    can_view_hub: true,
    can_create_order: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_dashboard: true,
    can_view_material_prices: true,
    can_manage_users: true,
    can_view_migration: true,
    can_view_studio: true,
    can_view_ai: true,
    can_view_calculator: true,
    can_view_marketing: true,
    can_view_production_offset: true,
    can_view_production_digital: true,
    can_view_production_service: true,
    can_view_warehouse_cardboard: true,
    can_view_warehouse_sheet_carton: true,
    can_view_warehouse_single_face: true,
    can_view_warehouse_cellophane: true,
    can_view_warehouse_pvc_film: true,
    can_view_warehouse_ink: true,
    can_view_storage: true,
    can_view_logs: true,
    can_view_license: true
  },
  ceo: {
    can_view_hub: true,
    can_create_order: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_dashboard: true,
    can_view_material_prices: true,
    can_manage_users: true,
    can_view_migration: true,
    can_view_studio: true,
    can_view_ai: true,
    can_view_calculator: true,
    can_view_marketing: true,
    can_view_production_offset: true,
    can_view_production_digital: true,
    can_view_production_service: true,
    can_view_warehouse_cardboard: true,
    can_view_warehouse_sheet_carton: true,
    can_view_warehouse_single_face: true,
    can_view_warehouse_cellophane: true,
    can_view_warehouse_pvc_film: true,
    can_view_warehouse_ink: true
  },
  marketer: {
    can_view_marketing: true,
    can_view_calculator: true
  },
  marketing: {
    can_view_marketing: true,
    can_view_calculator: true
  },
  sales: {
    can_view_hub: true,
    can_create_order: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_marketing: true,
    can_view_calculator: true
  },
  secretary: {
    can_view_hub: true,
    can_create_order: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_marketing: true
  },
  accounting: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_material_prices: true,
    can_view_calculator: true,
    can_view_marketing: true
  },
  estimation: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_material_prices: true,
    can_view_calculator: true,
    can_view_marketing: true
  },
  design: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_studio: true,
    can_view_ai: true
  },
  designer: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_studio: true,
    can_view_ai: true
  },
  mockup: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_production_service: true
  },
  outsource: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_production_service: true
  },
  production: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_production_offset: true,
    can_view_production_digital: true,
    can_view_production_service: true
  },
  warehouse: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_material_prices: true,
    can_view_warehouse_cardboard: true,
    can_view_warehouse_sheet_carton: true,
    can_view_warehouse_single_face: true,
    can_view_warehouse_cellophane: true,
    can_view_warehouse_pvc_film: true,
    can_view_warehouse_ink: true
  },
  procurement: {
    can_view_hub: true,
    can_view_archive: true,
    can_view_kanban: true,
    can_view_my_tasks: true,
    can_view_material_prices: true,
    can_view_warehouse_cardboard: true,
    can_view_warehouse_sheet_carton: true,
    can_view_warehouse_single_face: true,
    can_view_warehouse_cellophane: true,
    can_view_warehouse_pvc_film: true,
    can_view_warehouse_ink: true
  }
};

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

  const handleBiometricLogin = (loginResult) => {
    if (loginResult && loginResult.token) {
      localStorage.setItem('boxfactory_token', loginResult.token);
      setToken(loginResult.token);
      setCurrentUser(loginResult.user);
      return loginResult.user;
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
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'ceo') {
      // CEO is strictly restricted from Server License, raw Storage folder, and Audit/Activity Logs
      if (['can_view_storage', 'can_view_logs', 'can_view_license'].includes(permissionKey)) {
        return false;
      }
      return true;
    }
    if (currentUser.permissions && currentUser.permissions[permissionKey] !== undefined) {
      return Boolean(currentUser.permissions[permissionKey]);
    }
    const roleDefaults = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || {};
    return Boolean(roleDefaults[permissionKey]);
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
        loginBiometric: handleBiometricLogin,
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
