import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('kristallball_user');
    const storedToken = localStorage.getItem('kristallball_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Optionally verify with server /auth/me
      api.get('/auth/me')
        .then((res) => {
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('kristallball_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: loggedUser } = response.data;
      
      localStorage.setItem('kristallball_token', token);
      localStorage.setItem('kristallball_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('kristallball_token');
    localStorage.removeItem('kristallball_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isCommander: user?.role === 'BASE_COMMANDER',
    isLogistics: user?.role === 'LOGISTICS_OFFICER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
