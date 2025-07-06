import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on app load
    try {
      const savedAuth = localStorage.getItem('jnv_auth');
      if (savedAuth) {
        const { isAuth, role, timestamp } = JSON.parse(savedAuth);
        
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxAge && isAuth && role) {
          setIsAuthenticated(true);
          setUserRole(role);
        } else {
          // Session expired, clear it
          localStorage.removeItem('jnv_auth');
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      localStorage.removeItem('jnv_auth');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Validate input
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }

      // Simple authentication check - can be extended for multiple users
      if (username.toUpperCase() === 'ADMIN' && password === 'ADMIN') {
        const authData = {
          isAuth: true,
          role: 'admin',
          timestamp: Date.now(),
          username: username.toUpperCase()
        };

        setIsAuthenticated(true);
        setUserRole('admin');
        
        // Save to localStorage for persistence
        localStorage.setItem('jnv_auth', JSON.stringify(authData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem('jnv_auth');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if there's an error
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, loading }}>
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