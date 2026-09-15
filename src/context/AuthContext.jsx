import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService'; // <-- NEW

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        // Corrupted data in localStorage — clean it up
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login with email + password
   * Uses authService — works with mock data or real backend
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    // data = { token, user: { id, email, role, name } }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user; // Return user so the caller can redirect based on role
  };

  /**
   * Logout — clears everything
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Even if the API call fails, clear local data
      console.warn('Logout API failed:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}