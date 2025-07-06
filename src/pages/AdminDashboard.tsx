import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, Database, Mail, FileDown, UserPlus, BookOpen, Plus, Edit, Trash2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { dataManager } from '@/lib/dataManager';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    subject: '', 
    classes: ['8-A'] 
  });
  const [systemStats, setSystemStats] = useState(dataManager.getSystemStats());
  const [teachersList, setTeachersList] = useState(dataManager.getTeachers());
  const [recentExports, setRecentExports] = useState([
    { id: 1, type: 'Weekly Report', date: '2024-07-01', status: 'completed' },
    { id: 2, type: 'Monthly Analysis', date: '2024-06-30', status: 'completed' },
    { id: 3, type: 'Class-wise Report', date: '2024-06-28', status: 'completed' },
  ]);

  useEffect(() => {
    // Refresh data when component mounts
    setSystemStats(dataManager.getSystemStats());
    setTeachersList(dataManager.getTeachers());
  }, []);

  const handleExportData = (type: string) => {
    try {
      let csvContent = '';
      let filename = '';
      
      switch (type) {
        case 'students':
          csvContent = dataManager.exportToCSV('students');
          filename = `JNV_Students_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'teachers':
          csvContent = dataManager.exportToCSV('teachers');
          filename = `JNV_Teachers_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'attendance':
          csvContent = dataManager.exportToCSV('attendance');
          filename = `JNV_Attendance_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'all':
          csvContent = dataManager.exportToCSV('all');
          filename = `JNV_Complete_Export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          csvContent = dataManager.exportToCSV('all');
          filename = `JNV_Export_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      dataManager.downloadCSV(csvContent, filename);
      
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

  const handleAddTeacher = () => {
    try {
      if (!newTeacher.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Teacher name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!newTeacher.username.trim()) {
        toast({
          title: "Validation Error", 
          description: "Username is required.",
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

      if (!newTeacher.subject.trim()) {
        toast({
          title: "Validation Error",
          description: "Subject is required.",
          variant: "destructive",
        });
        return;
      }

      // Validate teacher data
      const validationErrors = dataManager.validateTeacherData(newTeacher);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Add teacher to database
      const addedTeacher = dataManager.addTeacher(newTeacher);
      
      // Update local state
      setTeachersList(dataManager.getTeachers());
      setSystemStats(dataManager.getSystemStats());
      
      toast({
        title: "Teacher Added",
        description: `${addedTeacher.name} has been added successfully.`,
      });
      
      // Reset form
      setNewTeacher({ 
        name: '', 
        username: '', 
        password: '', 
        subject: '', 
        classes: ['8-A'] 
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

  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    try {
      // Don't allow deleting the admin user
      if (teacherId === 'admin-001') {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete the system administrator account.",
          variant: "destructive",
        });
        return;
      }

      const deleted = dataManager.deleteTeacher(teacherId);
      if (deleted) {
        setTeachersList(dataManager.getTeachers());
        setSystemStats(dataManager.getSystemStats());
        toast({
          title: "Teacher Deleted",
          description: `${teacherName} has been removed from the system.`,
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete teacher.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete teacher: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
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
                  <p className="text-2xl font-bold text-netflix-text">{systemStats.totalAttendanceRecords || 0}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                        value={newTeacher.name}
                        onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter full name"
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
                      <Label htmlFor="teacher-username" className="text-netflix-text">Username</Label>
                      <Input
                        id="teacher-username"
                        value={newTeacher.username}
                        onChange={(e) => setNewTeacher({...newTeacher, username: e.target.value})}
                        className="bg-netflix-dark border-netflix-light-gray text-netflix-text"
                        placeholder="Enter username"
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
                {teachersList.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30">
                    <div>
                      <p className="font-medium text-netflix-text">{teacher.name}</p>
                      <p className="text-sm text-netflix-muted">{teacher.subject} • {teacher.classes.join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Active
                      </Badge>
                      {teacher.id !== 'admin-001' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-netflix-muted hover:text-red-400"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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