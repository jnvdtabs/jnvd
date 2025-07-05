import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, LogOut, Users, BarChart3, Upload } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  userRole?: 'teacher' | 'principal' | 'admin' | null;
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
    <div className="min-h-screen bg-netflix-dark">
      {/* Header */}
      <header className="bg-netflix-gray shadow-netflix border-b border-netflix-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-netflix-red" />
              <div>
                <h1 className="text-netflix-text text-xl font-bold">JNV Doddabalapura</h1>
                <p className="text-netflix-muted text-sm">Attendance Management System</p>
              </div>
            </div>

            {userRole && (
              <div className="flex items-center space-x-4">
                <span className="text-netflix-text capitalize">Welcome, Administrator</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="bg-netflix-light-gray/20 border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/40 transition-netflix"
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
        <nav className="bg-netflix-gray shadow-soft border-b border-netflix-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link
                to="/admin-dashboard"
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-netflix ${
                  isActive('/admin-dashboard')
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-netflix-muted hover:text-netflix-text hover:border-netflix-muted'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/teacher-dashboard"
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-netflix ${
                  isActive('/teacher-dashboard')
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-netflix-muted hover:text-netflix-text hover:border-netflix-muted'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Teacher View
              </Link>
              <Link
                to="/upload-students"
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-netflix ${
                  isActive('/upload-students')
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-netflix-muted hover:text-netflix-text hover:border-netflix-muted'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Students
              </Link>
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