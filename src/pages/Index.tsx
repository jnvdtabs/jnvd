import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (isAuthenticated) {
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, isAuthenticated, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-netflix-text">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;