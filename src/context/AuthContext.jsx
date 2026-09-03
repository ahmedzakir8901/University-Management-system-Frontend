import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // We will modify login to accept a role. 
  // For testing, we can pass 'ADMIN', 'FACULTY', or 'STUDENT'
  const login = (email, password, role = 'ADMIN') => {
    // In the future, this will call the backend.
    // For now, we just create a mock user.
    const mockUser = {
      id: 1,
      email: email,
      role: role, // <--- The role we pass in
      name: email.split('@')[0], // Use part before @ as name
    };
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
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