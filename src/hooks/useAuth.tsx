import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on app load
    const savedAuth = localStorage.getItem('jnv_auth');
    if (savedAuth) {
      const { isAuth, role } = JSON.parse(savedAuth);
      setIsAuthenticated(isAuth);
      setUserRole(role);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication check
    if (username === 'ADMIN' && password === 'ADMIN') {
      setIsAuthenticated(true);
      setUserRole('admin');
      
      // Save to localStorage for persistence
      localStorage.setItem('jnv_auth', JSON.stringify({
        isAuth: true,
        role: 'admin',
        timestamp: Date.now()
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('jnv_auth');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
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