import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { const savedUser = localStorage.getItem('user'); return savedUser ? JSON.parse(savedUser) : null; });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try { const res = await api.get('/auth/me'); if (res.data.success) { setUser(res.data.user); localStorage.setItem('user', JSON.stringify(res.data.user)); } }
        catch (err) { console.error('Failed to verify authentication token:', err); logout(); }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const saveSession = (data) => { setToken(data.token); setUser(data.user); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); };

  const login = async (email, password) => {
    try { const res = await api.post('/auth/login', { email, password }); if (res.data.success) { saveSession(res.data); toast.success(`Welcome back, ${res.data.user.name}!`); return { success: true, user: res.data.user }; } }
    catch (error) { const msg = error.response?.data?.message || 'Login failed. Please check credentials.'; toast.error(msg); return { success: false, message: msg }; }
  };

  const register = async (form) => {
    try { const res = await api.post('/auth/register', form); if (res.data.success) { saveSession(res.data); return { success: true, user: res.data.user }; } }
    catch (error) { const msg = error.response?.data?.message || 'Could not create account.'; toast.error(msg); return { success: false, message: msg }; }
  };

  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); };
  const updateUser = (updatedUserData) => { setUser(updatedUserData); localStorage.setItem('user', JSON.stringify(updatedUserData)); };
  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
