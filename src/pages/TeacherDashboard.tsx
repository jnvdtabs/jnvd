import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, BookOpen, CheckCircle, XCircle, Search } from 'lucide-react';

const TeacherDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 8-A');

  // Mock student data
  const students = [
    { id: 1, rollNo: 'JNV001', name: 'Aarav Kumar', class: '8-A', section: 'A', present: true },
    { id: 2, rollNo: 'JNV002', name: 'Priya Sharma', class: '8-A', section: 'A', present: true },
    { id: 3, rollNo: 'JNV003', name: 'Rohan Patel', class: '8-A', section: 'A', present: false },
    { id: 4, rollNo: 'JNV004', name: 'Ananya Singh', class: '8-A', section: 'A', present: true },
    { id: 5, rollNo: 'JNV005', name: 'Arjun Reddy', class: '8-A', section: 'A', present: true },
    { id: 6, rollNo: 'JNV006', name: 'Kavya Nair', class: '8-A', section: 'A', present: false },
  ];

  const [attendance, setAttendance] = useState(
    students.map(student => ({ ...student }))
  );

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendance(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, present } : student
      )
    );
  };

  const filteredStudents = attendance.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = attendance.filter(s => s.present).length;
  const totalCount = attendance.length;
  const attendancePercentage = Math.round((presentCount / totalCount) * 100);

  const handleSaveAttendance = () => {
    // Handle save attendance logic here
    console.log('Saving attendance for', selectedDate, attendance);
  };

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-education-dark mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage attendance for your classes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-education-dark">{totalCount}</p>
                </div>
                <Users className="h-8 w-8 text-education-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-bold text-education-green">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-education-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                  <p className="text-2xl font-bold text-destructive">{totalCount - presentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance %</p>
                  <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Management */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-education-dark">Mark Attendance</CardTitle>
                <CardDescription>Select date and mark attendance for {selectedClass}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <Button 
                  onClick={handleSaveAttendance}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-soft"
                >
                  Save Attendance
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={student.present}
                        onCheckedChange={(checked) => 
                          handleAttendanceChange(student.id, checked as boolean)
                        }
                      />
                    </div>
                    <div>
                      <p className="font-medium text-education-dark">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={student.present ? "default" : "destructive"}>
                      {student.present ? 'Present' : 'Absent'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {student.class}-{student.section}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;