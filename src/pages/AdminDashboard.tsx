import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Mail, FileDown, UserPlus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { toast } = useToast();

  const systemStats = {
    totalTeachers: 45,
    totalClasses: 28,
    totalSections: 84,
    dataSize: '2.4 GB'
  };

  const recentExports = [
    { id: 1, type: 'Weekly Report', date: '2024-07-01', status: 'completed' },
    { id: 2, type: 'Monthly Analysis', date: '2024-06-30', status: 'completed' },
    { id: 3, type: 'Class-wise Report', date: '2024-06-28', status: 'completed' },
  ];

  const handleExportData = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} export has been initiated. You'll receive an email when ready.`,
    });
  };

  const handleSendReminder = () => {
    toast({
      title: "Reminders Sent",
      description: "Email reminders have been sent to all teachers.",
    });
  };

  return (
    <Layout userRole="principal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-education-dark mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System management and data administration</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold text-education-dark">{systemStats.totalTeachers}</p>
                </div>
                <Users className="h-8 w-8 text-education-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold text-education-green">{systemStats.totalClasses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-education-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sections</p>
                  <p className="text-2xl font-bold text-primary">{systemStats.totalSections}</p>
                </div>
                <Settings className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Size</p>
                  <p className="text-2xl font-bold text-education-dark">{systemStats.dataSize}</p>
                </div>
                <Database className="h-8 w-8 text-education-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Export */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>Export attendance data and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => handleExportData('Weekly Report')}
                  className="w-full justify-start bg-white hover:bg-gray-50 text-education-dark border shadow-sm"
                  variant="outline"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Weekly Report
                </Button>
                
                <Button 
                  onClick={() => handleExportData('Monthly Analysis')}
                  className="w-full justify-start bg-white hover:bg-gray-50 text-education-dark border shadow-sm"
                  variant="outline"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Monthly Analysis
                </Button>
                
                <Button 
                  onClick={() => handleExportData('Complete Database')}
                  className="w-full justify-start bg-white hover:bg-gray-50 text-education-dark border shadow-sm"
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Export Complete Database
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark">Recent Exports</CardTitle>
              <CardDescription>Latest data export history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExports.map((export_item) => (
                  <div key={export_item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-education-dark">{export_item.type}</p>
                      <p className="text-sm text-muted-foreground">{export_item.date}</p>
                    </div>
                    <Badge variant="outline" className="text-education-green border-education-green">
                      {export_item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Reminders */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Reminders
              </CardTitle>
              <CardDescription>Send reminders to teachers and staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send automated reminders to teachers about attendance submission deadlines.
                </p>
                <Button 
                  onClick={handleSendReminder}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-soft"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Weekly Reminders
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage teacher and admin accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start bg-white hover:bg-gray-50 text-education-dark border shadow-sm"
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Teacher
                </Button>
                
                <Button 
                  className="w-full justify-start bg-white hover:bg-gray-50 text-education-dark border shadow-sm"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;