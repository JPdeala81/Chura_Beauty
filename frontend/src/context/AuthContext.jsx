import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (token) {
        try {
          const response = await authService.getAdmin(token);
          setAdmin(response.data.admin);
        } catch (error) {
          console.error('Error fetching admin:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchAdmin();
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token: newToken, admin: newAdmin } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setAdmin(newAdmin);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAdmin(null);
  };

  const updateAdmin = async (data) => {
    const response = await authService.updateAdmin(data, token);
    setAdmin(response.data.admin);
    return response;
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    updateAdmin,
    isAuthenticated: !!token && !!admin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
