import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('email');
    const storedAccountId = localStorage.getItem('accountId');

    if (storedToken && storedEmail && storedAccountId) {
      setToken(storedToken);
      setEmail(storedEmail);
      setAccountId(storedAccountId);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userEmail: string, authToken: string, userAccountId: string) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('accountId', userAccountId);
    setToken(authToken);
    setEmail(userEmail);
    setAccountId(userAccountId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    localStorage.removeItem('accountId');
    setToken(null);
    setEmail(null);
    setAccountId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, accountId, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
