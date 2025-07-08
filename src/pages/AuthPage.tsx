import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDatabase } from '@/hooks/useDatabase';

const AuthPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'teacher' as 'teacher' | 'principal' | 'admin',
    department: '',
    subject: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useSupabaseAuth();
  const { sendAdminNotification } = useDatabase();

  // Redirect if already authenticated
  if (!loading && user) {
    navigate('/admin-dashboard', { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        setError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate passwords match
      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate required fields
      if (!signupData.email || !signupData.password || !signupData.full_name) {
        setError('Please fill in all required fields');
        return;
      }

      const { error } = await signUp(signupData.email, signupData.password, {
        full_name: signupData.full_name,
        role: signupData.role,
        department: signupData.department,
        subject: signupData.subject
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Send admin notification email
        await sendAdminNotification(
          signupData.email,
          signupData.full_name,
          signupData.role,
          '' // Profile ID will be set by the database trigger
        );

        toast({
          title: "Account Created",
          description: "Please check your email to verify your account. Your registration is pending admin approval.",
        });
        
        // Reset form
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          role: 'teacher',
          department: '',
          subject: ''
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
      setError(errorMessage);
      toast({
        title: "Signup Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative rounded-2xl overflow-hidden shadow-elegant">
            <img 
              src="/src/assets/school-hero.jpg" 
              alt="Jawahar Navodaya Vidyalaya, Doddabalapura" 
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark/80 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Jawahar Navodaya Vidyalaya</h2>
                <p className="text-white/90">Doddabalapura - Excellence in Education</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto bg-card shadow-netflix border border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-netflix-text">JNV Attendance System</CardTitle>
            <CardDescription className="text-netflix-muted">
              Access the attendance management system
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-netflix-text">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-netflix-text">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white shadow-netflix transition-netflix"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-netflix-text">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter email address"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-netflix-text">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter full name"
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({...signupData, full_name: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="text-netflix-text">Role</Label>
                    <Select value={signupData.role} onValueChange={(value: 'teacher' | 'principal' | 'admin') => setSignupData({...signupData, role: value})}>
                      <SelectTrigger className="bg-netflix-dark border-netflix-light-gray text-netflix-text">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {signupData.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-subject" className="text-netflix-text">Subject</Label>
                      <Input
                        id="signup-subject"
                        type="text"
                        placeholder="Enter subject"
                        value={signupData.subject}
                        onChange={(e) => setSignupData({...signupData, subject: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-netflix-text">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Enter password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-netflix-text">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        className="pl-10 bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white shadow-netflix transition-netflix"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;