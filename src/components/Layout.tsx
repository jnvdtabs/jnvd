import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, LogOut, Users, BarChart3, Upload } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  userRole?: 'teacher' | 'principal' | null;
}

const Layout = ({ children, userRole }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-education-light to-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-white text-xl font-bold">JNV Doddabalapura</h1>
                <p className="text-white/80 text-sm">Attendance Management System</p>
              </div>
            </div>

            {userRole && (
              <div className="flex items-center space-x-4">
                <span className="text-white/90 capitalize">Welcome, {userRole}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {userRole && (
        <nav className="bg-white shadow-soft border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {userRole === 'teacher' && (
                <>
                  <Link
                    to="/teacher-dashboard"
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/teacher-dashboard')
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    My Classes
                  </Link>
                  <Link
                    to="/upload-students"
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/upload-students')
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Students
                  </Link>
                </>
              )}

              {userRole === 'principal' && (
                <>
                  <Link
                    to="/principal-dashboard"
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/principal-dashboard')
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/admin-dashboard')
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage System
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;