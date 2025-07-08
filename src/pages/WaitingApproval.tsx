import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, RefreshCw } from 'lucide-react';

const WaitingApproval = () => {
  const { user, signOut } = useSupabaseAuth();
  const { getCurrentUserProfile } = useDatabase();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user) return;
      
      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);
      
      if (userProfile?.approved) {
        if (userProfile.quiz_completed) {
          // User is approved and completed quiz, redirect to appropriate dashboard
          switch (userProfile.role) {
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
        } else {
          // User is approved but hasn't completed quiz
          navigate('/quiz', { replace: true });
        }
      }
      setLoading(false);
    };

    checkApprovalStatus();
  }, [user, navigate, getCurrentUserProfile]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-netflix-text">Checking approval status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card shadow-netflix border border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-netflix-red/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-netflix-red" />
          </div>
          <CardTitle className="text-2xl font-bold text-netflix-text">Awaiting Approval</CardTitle>
          <CardDescription className="text-netflix-muted">
            Your account is pending admin approval
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30">
              <Mail className="h-6 w-6 text-netflix-muted mx-auto mb-2" />
              <p className="text-sm text-netflix-muted">
                Your registration has been submitted and an admin has been notified.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-netflix-text font-medium">Account Details:</p>
              <div className="text-sm text-netflix-muted space-y-1">
                <p>Name: {profile?.full_name}</p>
                <p>Role: {profile?.role}</p>
                <p>Email: {user?.email}</p>
              </div>
            </div>
            
            <p className="text-sm text-netflix-muted">
              You will receive an email notification once your account has been approved. 
              Please check your email regularly or refresh this page.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRefresh}
              className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/20"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingApproval;