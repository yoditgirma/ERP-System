import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login/', { username, password });
      
      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register/', userData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile/', data);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isSuperAdmin: user?.roles?.includes('Super Administrator') || false,
    isAdmin: user?.roles?.includes('Administrator') || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};