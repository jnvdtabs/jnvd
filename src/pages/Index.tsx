import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useDatabase } from '@/hooks/useDatabase';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();
  const { getCurrentUserProfile } = useDatabase();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (user) {
      // Check user profile and approval status
      getCurrentUserProfile().then((profile) => {
        if (!profile) {
          navigate('/auth', { replace: true });
          return;
        }

        if (!profile.approved) {
          navigate('/waiting-approval', { replace: true });
          return;
        }

        if (!profile.quiz_completed && profile.role !== 'admin') {
          navigate('/quiz', { replace: true });
          return;
        }

        // User is approved and completed quiz, redirect to appropriate dashboard
        switch (profile.role) {
          case 'admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'principal':
            navigate('/principal-dashboard', { replace: true });
            break;
          case 'teacher':
            navigate('/teacher-dashboard', { replace: true });
            break;
          default:
            navigate('/teacher-dashboard', { replace: true });
        }
      });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate, user, loading, getCurrentUserProfile]);

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