import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, TrendingUp, AlertTriangle, Calendar, School } from 'lucide-react';

const PrincipalDashboard = () => {
  // Mock data for analytics
  const overallStats = {
    totalStudents: 1250,
    presentToday: 1186,
    absentToday: 64,
    attendanceRate: 94.9
  };

  const classWiseData = [
    { class: '6th Grade', total: 200, present: 185, percentage: 92.5 },
    { class: '7th Grade', total: 195, present: 188, percentage: 96.4 },
    { class: '8th Grade', total: 210, present: 202, percentage: 96.2 },
    { class: '9th Grade', total: 220, present: 210, percentage: 95.5 },
    { class: '10th Grade', total: 215, present: 201, percentage: 93.5 },
    { class: '11th Grade', total: 105, present: 98, percentage: 93.3 },
    { class: '12th Grade', total: 105, present: 102, percentage: 97.1 },
  ];

  const lowAttendanceStudents = [
    { name: 'Rahul Kumar', class: '9-B', attendance: 67 },
    { name: 'Sneha Patel', class: '8-A', attendance: 72 },
    { name: 'Amit Singh', class: '10-C', attendance: 69 },
    { name: 'Pooja Sharma', class: '7-B', attendance: 74 },
  ];

  const weeklyTrend = [
    { day: 'Mon', percentage: 96.2 },
    { day: 'Tue', percentage: 94.8 },
    { day: 'Wed', percentage: 95.1 },
    { day: 'Thu', percentage: 93.7 },
    { day: 'Fri', percentage: 94.9 },
  ];

  return (
    <Layout userRole="principal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-education-dark mb-2">Principal Dashboard</h1>
          <p className="text-muted-foreground">School-wide attendance analytics and insights</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-education-dark">{overallStats.totalStudents}</p>
                </div>
                <School className="h-8 w-8 text-education-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-bold text-education-green">{overallStats.presentToday}</p>
                </div>
                <Users className="h-8 w-8 text-education-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                  <p className="text-2xl font-bold text-destructive">{overallStats.absentToday}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold text-primary">{overallStats.attendanceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class-wise Attendance */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="text-education-dark flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Class-wise Attendance
            </CardTitle>
            <CardDescription>Current attendance by grade level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classWiseData.map((classData) => (
                <div key={classData.class} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className="w-20">
                      <p className="font-medium text-education-dark">{classData.class}</p>
                    </div>
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">
                          {classData.present}/{classData.total} students
                        </span>
                        <span className="text-sm font-medium">
                          {classData.percentage}%
                        </span>
                      </div>
                      <Progress value={classData.percentage} className="h-2" />
                    </div>
                  </div>
                  <Badge 
                    variant={classData.percentage >= 95 ? "default" : 
                             classData.percentage >= 90 ? "secondary" : "destructive"}
                  >
                    {classData.percentage >= 95 ? 'Excellent' : 
                     classData.percentage >= 90 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Attendance Trend
              </CardTitle>
              <CardDescription>This week's daily attendance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyTrend.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="font-medium text-education-dark w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <Progress value={day.percentage} className="h-3" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{day.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Attendance Students */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-education-dark flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Students Requiring Attention
              </CardTitle>
              <CardDescription>Students with attendance below 75%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowAttendanceStudents.map((student) => (
                  <div key={student.name} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-education-dark">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Class {student.class}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{student.attendance}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PrincipalDashboard;