import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lux_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch (err) {
        console.error('Error parsing auth data:', err);
        localStorage.removeItem('lux_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem(
      'lux_auth',
      JSON.stringify({ user: payload.user, token: payload.token })
    );
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('lux_auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


