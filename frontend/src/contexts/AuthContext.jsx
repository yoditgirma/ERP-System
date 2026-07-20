// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

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

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      toast.success(`Welcome back, ${user.full_name || user.username}!`);
      
      return { success: true, user };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    
    // ============ ROLE CHECK FUNCTIONS ============
    isSystemAdmin: user?.roles?.includes('Super Administrator') || false,
    isAdministrator: user?.roles?.includes('Administrator') || false,
    isStandardUser: user?.roles?.includes('Standard User') || false,
    
    // Combined checks
    canManageUsers: user?.roles?.some(role => 
      ['Super Administrator', 'Administrator'].includes(role)
    ) || false,
    
    canManageSystem: user?.roles?.includes('Super Administrator') || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};