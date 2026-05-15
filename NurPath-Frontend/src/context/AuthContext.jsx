import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nurpath_token');
    const cached = localStorage.getItem('nurpath_user');
    if (token && cached) {
      setUser(JSON.parse(cached));
      // Verify token is still valid
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('nurpath_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('nurpath_token');
          localStorage.removeItem('nurpath_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('nurpath_token', token);
    localStorage.setItem('nurpath_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password, city) => {
    const res = await api.post('/auth/register', { name, email, password, city });
    const { token, user } = res.data;
    localStorage.setItem('nurpath_token', token);
    localStorage.setItem('nurpath_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('nurpath_token');
    localStorage.removeItem('nurpath_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('nurpath_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
