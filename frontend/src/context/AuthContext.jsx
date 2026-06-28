import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('lifesaver_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const login = (data) => {
    localStorage.setItem('lifesaver_token', data.token);
    localStorage.setItem('lifesaver_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('lifesaver_token');
    localStorage.removeItem('lifesaver_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) =>
    setUser(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};