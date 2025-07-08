import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, CheckCircle } from 'lucide-react';

const Quiz = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    class_teacher_class: '',
    class_teacher_section: '',
    name: '',
    class_strength: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!answers.class_teacher_class || !answers.class_teacher_section || !answers.name || !answers.class_strength) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Update user profile with quiz answers
      const { error } = await supabase
        .from('profiles')
        .update({
          quiz_completed: true,
          class_teacher_class: answers.class_teacher_class,
          class_teacher_section: answers.class_teacher_section,
          full_name: answers.name, // Update name if needed
          class_strength: parseInt(answers.class_strength)
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Quiz Completed",
        description: "Welcome to the JNV Attendance System!",
      });

      // Redirect to appropriate dashboard
      navigate('/teacher-dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to complete quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const classes = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B'];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card shadow-netflix border border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-netflix-text">Teacher Information</CardTitle>
          <CardDescription className="text-netflix-muted">
            Please complete your profile to access the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-netflix-text">
                  Which class are you the class teacher for? *
                </Label>
                <Select 
                  value={answers.class_teacher_class} 
                  onValueChange={(value) => setAnswers({...answers, class_teacher_class: value})}
                >
                  <SelectTrigger className="bg-netflix-dark border-netflix-light-gray text-netflix-text">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section" className="text-netflix-text">
                  Section *
                </Label>
                <Select 
                  value={answers.class_teacher_section} 
                  onValueChange={(value) => setAnswers({...answers, class_teacher_section: value})}
                >
                  <SelectTrigger className="bg-netflix-dark border-netflix-light-gray text-netflix-text">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-netflix-text">
                Your full name *
              </Label>
              <Input
                id="name"
                type="text"
                value={answers.name}
                onChange={(e) => setAnswers({...answers, name: e.target.value})}
                className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strength" className="text-netflix-text">
                Total strength of your class *
              </Label>
              <Input
                id="strength"
                type="number"
                min="1"
                max="100"
                value={answers.class_strength}
                onChange={(e) => setAnswers({...answers, class_strength: e.target.value})}
                className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                placeholder="Enter total number of students"
                required
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-netflix-muted">
                This information will help us set up your dashboard and attendance management features.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completing Setup...
                </div>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;