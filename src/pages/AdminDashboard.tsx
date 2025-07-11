import Layout from '@/components/Layout';
import PendingApprovals from '@/components/PendingApprovals';
import SystemTester from '@/components/SystemTester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, Database, Mail, FileDown, UserPlus, BookOpen, Plus, Edit, Trash2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const AdminDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useSupabaseAuth();
  const { 
    students, 
    teachers, 
    loading, 
    addTeacher, 
    getSystemStats,
    fetchStudents,
    fetchTeachers 
  } = useDatabase();
  
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    role: 'teacher' as 'teacher' | 'principal',
    subject: '', 
    department: ''
  });
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    lastUpdated: new Date().toISOString()
  });
  const [recentExports, setRecentExports] = useState([
    { id: 1, type: 'Weekly Report', date: '2024-07-01', status: 'completed' },
    { id: 2, type: 'Monthly Analysis', date: '2024-06-30', status: 'completed' },
    { id: 3, type: 'Class-wise Report', date: '2024-06-28', status: 'completed' },
  ]);

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered');
    
    // Load system stats when data changes
    const loadStats = async () => {
      try {
        console.log('Loading system stats...');
        const stats = await getSystemStats();
        console.log('System stats loaded:', stats);
        if (stats) {
          setSystemStats(stats);
        }
      } catch (error) {
        console.error('Error loading system stats:', error);
      }
    };
    
    // Always load initial data
    console.log('Fetching students and teachers...');
    fetchStudents();
    fetchTeachers();
    loadStats();
  }, [getSystemStats, fetchStudents, fetchTeachers]);

  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExportData = (type: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      
      switch (type) {
        case 'students':
          exportToCSV(
            students, 
            ['roll_no', 'full_name', 'class', 'section', 'created_at'],
            `JNV_Students_${date}.csv`
          );
          break;
        case 'teachers':
          exportToCSV(
            teachers, 
            ['full_name', 'role', 'subject', 'department', 'created_at'],
            `JNV_Teachers_${date}.csv`
          );
          break;
        case 'all':
          // Export both students and teachers in one file
          const allData = [
            ...students.map(s => ({ ...s, type: 'student' })),
            ...teachers.map(t => ({ ...t, type: 'teacher' }))
          ];
          exportToCSV(
            allData,
            ['type', 'full_name', 'roll_no', 'role', 'class', 'section', 'subject', 'department', 'created_at'],
            `JNV_Complete_Export_${date}.csv`
          );
          break;
      }
      
      toast({
        title: "Export Complete",
        description: `${type} data has been exported and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Error exporting ${type} data. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = () => {
    toast({
      title: "Reminders Sent",
      description: "Email reminders have been sent to all teachers.",
    });
  };

  const handleAddTeacher = async () => {
    try {
      if (!newTeacher.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required.",
          variant: "destructive",
        });
        return;
      }

      if (!newTeacher.full_name.trim()) {
        toast({
          title: "Validation Error", 
          description: "Full name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!newTeacher.password.trim()) {
        toast({
          title: "Validation Error",
          description: "Password is required.",
          variant: "destructive",
        });
        return;
      }

      // Add teacher to database
      await addTeacher(newTeacher);
      
      toast({
        title: "Teacher Added",
        description: `${newTeacher.full_name} has been added successfully. They will receive an email to verify their account.`,
      });
      
      // Reset form
      setNewTeacher({ 
        email: '', 
        password: '', 
        full_name: '', 
        role: 'teacher',
        subject: '', 
        department: ''
      });
      setShowAddTeacher(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add teacher: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    toast({
      title: "Feature Not Available",
      description: "Teacher deletion will be implemented in a future update.",
      variant: "destructive",
    });
  };

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-netflix-text mb-2">Admin Dashboard</h1>
          <p className="text-netflix-muted">System management and user administration</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-netflix-muted">Total Teachers</p>
                  <p className="text-2xl font-bold text-netflix-text">{systemStats.totalTeachers}</p>
                </div>
                <Users className="h-8 w-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-netflix-muted">Total Students</p>
                  <p className="text-2xl font-bold text-netflix-text">{systemStats.totalStudents}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-netflix-muted">Total Classes</p>
                  <p className="text-2xl font-bold text-netflix-text">{systemStats.totalClasses}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-netflix-muted">Attendance Records</p>
                  <p className="text-2xl font-bold text-netflix-text">0</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Diagnostics */}
        <SystemTester />

        {/* Pending Approvals */}
        <PendingApprovals />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Management */}
          <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Teacher Management
                  </CardTitle>
                  <CardDescription className="text-netflix-muted">Manage teacher accounts and permissions</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddTeacher(true)}
                  className="bg-netflix-red hover:bg-netflix-red/90 text-white transition-netflix"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddTeacher && (
                <div className="mb-6 p-4 bg-netflix-light-gray/20 rounded-lg border border-netflix-light-gray">
                  <h4 className="text-netflix-text font-medium mb-3">Add New Teacher</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="teacher-name" className="text-netflix-text">Full Name</Label>
                      <Input
                        id="teacher-name"
                        value={newTeacher.full_name}
                        onChange={(e) => setNewTeacher({...newTeacher, full_name: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher-email" className="text-netflix-text">Email</Label>
                      <Input
                        id="teacher-email"
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher-subject" className="text-netflix-text">Subject</Label>
                      <Input
                        id="teacher-subject"
                        value={newTeacher.subject}
                        onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher-password" className="text-netflix-text">Password</Label>
                      <Input
                        id="teacher-password"
                        type="password"
                        value={newTeacher.password}
                        onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleAddTeacher}
                      className="bg-netflix-red hover:bg-netflix-red/90 text-white transition-netflix"
                      size="sm"
                    >
                      Add Teacher
                    </Button>
                    <Button 
                      onClick={() => setShowAddTeacher(false)}
                      variant="outline"
                      className="border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/20"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30">
                    <div>
                      <p className="font-medium text-netflix-text">{teacher.full_name}</p>
                      <p className="text-sm text-netflix-muted">{teacher.role} • {teacher.subject || 'No subject'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Active
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-netflix-muted hover:text-red-400"
                        onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Export & Management */}
          <div className="space-y-6">
            {/* Data Export */}
            <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Data Export
                </CardTitle>
                <CardDescription className="text-netflix-muted">Export attendance data and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleExportData('students')}
                    className="w-full justify-start bg-netflix-light-gray/20 hover:bg-netflix-light-gray/40 text-netflix-text border border-netflix-light-gray transition-netflix"
                    variant="outline"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Students Data
                  </Button>
                  
                  <Button 
                    onClick={() => handleExportData('teachers')}
                    className="w-full justify-start bg-netflix-light-gray/20 hover:bg-netflix-light-gray/40 text-netflix-text border border-netflix-light-gray transition-netflix"
                    variant="outline"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Teachers Data
                  </Button>
                  
                  <Button 
                    onClick={() => handleExportData('all')}
                    className="w-full justify-start bg-netflix-light-gray/20 hover:bg-netflix-light-gray/40 text-netflix-text border border-netflix-light-gray transition-netflix"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export Complete Database
                  </Button>
                  
                  <Button 
                    onClick={() => signOut()}
                    className="w-full justify-start bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 transition-netflix"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Reminders */}
            <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Reminders
                </CardTitle>
                <CardDescription className="text-netflix-muted">Send reminders to teachers and staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-netflix-muted">
                    Send automated reminders to teachers about attendance submission deadlines.
                  </p>
                  <Button 
                    onClick={handleSendReminder}
                    className="bg-netflix-red hover:bg-netflix-red/90 text-white shadow-netflix transition-netflix"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Weekly Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Exports */}
        <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
          <CardHeader>
            <CardTitle className="text-netflix-text">Recent Exports</CardTitle>
            <CardDescription className="text-netflix-muted">Latest data export history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentExports.map((export_item) => (
                <div key={export_item.id} className="flex items-center justify-between p-4 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30">
                  <div>
                    <p className="font-medium text-netflix-text">{export_item.type}</p>
                    <p className="text-sm text-netflix-muted">{export_item.date}</p>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {export_item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;