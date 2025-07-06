// Comprehensive System Testing Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Upload, 
  Download,
  Search,
  RefreshCw,
  FileText,
  Users,
  BookOpen
} from 'lucide-react';
import { dataManager, type Student, type Teacher } from '@/lib/dataManager';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'running' | 'pending';
}

const SystemTester = () => {
  const { toast } = useToast();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<string>('');

  // Sample test data
  const sampleStudents: Omit<Student, 'id' | 'dateAdded'>[] = [
    { rollNo: 'TEST001', name: 'Test Student 1', class: '8', section: 'A' },
    { rollNo: 'TEST002', name: 'Test Student 2', class: '8', section: 'A' },
    { rollNo: 'TEST003', name: 'Test Student 3', class: '9', section: 'B' },
    { rollNo: 'TEST004', name: 'Test Student 4', class: '9', section: 'B' },
    { rollNo: 'TEST005', name: 'Test Student 5', class: '10', section: 'C' },
  ];

  const sampleTeachers: Omit<Teacher, 'id' | 'dateAdded'>[] = [
    { name: 'Test Teacher 1', username: 'test_teacher1', password: 'test123', subject: 'Mathematics', classes: ['8-A', '9-B'] },
    { name: 'Test Teacher 2', username: 'test_teacher2', password: 'test123', subject: 'Science', classes: ['10-C'] },
  ];

  // Test 1: Database Management
  const testDatabaseManagement = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // Test 1.1: Clear all data
      dataManager.clearAllData();
      const initialData = dataManager.getData();
      results.push({
        name: 'Clear Database',
        status: initialData.students.length === 0 ? 'passed' : 'failed',
        message: `Database cleared. Students: ${initialData.students.length}, Teachers: ${initialData.teachers.length}`,
      });

      // Test 1.2: Add sample students
      const addedStudents = dataManager.addMultipleStudents(sampleStudents);
      results.push({
        name: 'Add Multiple Students',
        status: addedStudents.length === sampleStudents.length ? 'passed' : 'failed',
        message: `Added ${addedStudents.length} students successfully`,
        details: addedStudents.map(s => `${s.rollNo}: ${s.name}`).join(', ')
      });

      // Test 1.3: Add sample teachers
      let teachersAdded = 0;
      for (const teacher of sampleTeachers) {
        try {
          dataManager.addTeacher(teacher);
          teachersAdded++;
        } catch (error) {
          console.error('Error adding teacher:', error);
        }
      }
      results.push({
        name: 'Add Teachers',
        status: teachersAdded === sampleTeachers.length ? 'passed' : 'failed',
        message: `Added ${teachersAdded} teachers successfully`,
      });

      // Test 1.4: Validate data persistence
      const persistedData = dataManager.getData();
      results.push({
        name: 'Data Persistence',
        status: persistedData.students.length > 0 && persistedData.teachers.length > 1 ? 'passed' : 'failed',
        message: `Data persisted: ${persistedData.students.length} students, ${persistedData.teachers.length} teachers`,
      });

    } catch (error) {
      results.push({
        name: 'Database Management',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return results;
  };

  // Test 2: CRUD Operations
  const testCRUDOperations = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      const students = dataManager.getStudents();
      if (students.length === 0) {
        results.push({
          name: 'CRUD Prerequisites',
          status: 'failed',
          message: 'No students found for CRUD testing',
        });
        return results;
      }

      // Test 2.1: Read operations
      const allStudents = dataManager.getStudents();
      results.push({
        name: 'Read Students',
        status: allStudents.length > 0 ? 'passed' : 'failed',
        message: `Retrieved ${allStudents.length} students`,
      });

      // Test 2.2: Update operation
      const firstStudent = students[0];
      const updatedStudent = dataManager.updateStudent(firstStudent.id, { name: 'Updated Test Student' });
      results.push({
        name: 'Update Student',
        status: updatedStudent && updatedStudent.name === 'Updated Test Student' ? 'passed' : 'failed',
        message: updatedStudent ? 'Student updated successfully' : 'Failed to update student',
      });

      // Test 2.3: Search functionality
      const searchResults = dataManager.searchStudents('Updated');
      results.push({
        name: 'Search Students',
        status: searchResults.length > 0 ? 'passed' : 'failed',
        message: `Found ${searchResults.length} students matching search`,
      });

      // Test 2.4: Delete operation
      const lastStudent = students[students.length - 1];
      const deleted = dataManager.deleteStudent(lastStudent.id);
      results.push({
        name: 'Delete Student',
        status: deleted ? 'passed' : 'failed',
        message: deleted ? 'Student deleted successfully' : 'Failed to delete student',
      });

    } catch (error) {
      results.push({
        name: 'CRUD Operations',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return results;
  };

  // Test 3: Data Export/Import
  const testDataExport = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // Test 3.1: Export students CSV
      const studentsCSV = dataManager.exportToCSV('students');
      results.push({
        name: 'Export Students CSV',
        status: studentsCSV.includes('Roll No,Student Name') ? 'passed' : 'failed',
        message: `Generated CSV: ${studentsCSV.split('\n').length - 1} rows`,
        details: studentsCSV.substring(0, 100) + '...'
      });

      // Test 3.2: Export teachers CSV
      const teachersCSV = dataManager.exportToCSV('teachers');
      results.push({
        name: 'Export Teachers CSV',
        status: teachersCSV.includes('Name,Username,Subject') ? 'passed' : 'failed',
        message: `Generated CSV: ${teachersCSV.split('\n').length - 1} rows`,
      });

      // Test 3.3: Export complete system data
      const allDataCSV = dataManager.exportToCSV('all');
      results.push({
        name: 'Export Complete Data',
        status: allDataCSV.includes('JNV Doddabalapura') ? 'passed' : 'failed',
        message: `Generated complete export: ${allDataCSV.length} characters`,
      });

    } catch (error) {
      results.push({
        name: 'Data Export',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return results;
  };

  // Test 4: Validation and Error Handling
  const testValidation = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // Test 4.1: Invalid student data
      const invalidStudent = { rollNo: '', name: '', class: '', section: '' };
      const studentErrors = dataManager.validateStudentData(invalidStudent);
      results.push({
        name: 'Student Validation',
        status: studentErrors.length > 0 ? 'passed' : 'failed',
        message: `Found ${studentErrors.length} validation errors`,
        details: studentErrors.join(', ')
      });

      // Test 4.2: Duplicate roll number
      const duplicateStudent = { rollNo: 'TEST001', name: 'Duplicate Student', class: '8', section: 'A' };
      const duplicateErrors = dataManager.validateStudentData(duplicateStudent);
      results.push({
        name: 'Duplicate Detection',
        status: duplicateErrors.some(e => e.includes('already exists')) ? 'passed' : 'failed',
        message: `Duplicate validation: ${duplicateErrors.length} errors`,
      });

      // Test 4.3: Invalid teacher data
      const invalidTeacher = { name: '', username: '', password: '', subject: '', classes: [] };
      const teacherErrors = dataManager.validateTeacherData(invalidTeacher);
      results.push({
        name: 'Teacher Validation',
        status: teacherErrors.length > 0 ? 'passed' : 'failed',
        message: `Found ${teacherErrors.length} validation errors`,
      });

    } catch (error) {
      results.push({
        name: 'Validation Tests',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return results;
  };

  // Test 5: System Statistics
  const testSystemStats = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      const stats = dataManager.getSystemStats();
      
      results.push({
        name: 'System Statistics',
        status: 'passed',
        message: `Stats calculated successfully`,
        details: `Students: ${stats.totalStudents}, Teachers: ${stats.totalTeachers}, Classes: ${stats.totalClasses}, Storage: ${stats.storageSize}`
      });

      results.push({
        name: 'Storage Size Check',
        status: stats.storageSize !== '0.00 KB' ? 'passed' : 'warning',
        message: `Current storage usage: ${stats.storageSize}`,
      });

    } catch (error) {
      results.push({
        name: 'System Statistics',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return results;
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const suites: TestSuite[] = [
      { name: 'Database Management', tests: [], status: 'running' },
      { name: 'CRUD Operations', tests: [], status: 'pending' },
      { name: 'Data Export/Import', tests: [], status: 'pending' },
      { name: 'Validation & Error Handling', tests: [], status: 'pending' },
      { name: 'System Statistics', tests: [], status: 'pending' },
    ];

    setTestSuites([...suites]);

    try {
      // Run Database Management tests
      setProgress(20);
      suites[0].tests = await testDatabaseManagement();
      suites[0].status = suites[0].tests.every(t => t.status === 'passed') ? 'passed' : 'failed';
      suites[1].status = 'running';
      setTestSuites([...suites]);

      // Run CRUD tests
      setProgress(40);
      suites[1].tests = await testCRUDOperations();
      suites[1].status = suites[1].tests.every(t => t.status === 'passed') ? 'passed' : 'failed';
      suites[2].status = 'running';
      setTestSuites([...suites]);

      // Run Export tests
      setProgress(60);
      suites[2].tests = await testDataExport();
      suites[2].status = suites[2].tests.every(t => t.status === 'passed') ? 'passed' : 'failed';
      suites[3].status = 'running';
      setTestSuites([...suites]);

      // Run Validation tests
      setProgress(80);
      suites[3].tests = await testValidation();
      suites[3].status = suites[3].tests.every(t => t.status === 'passed') ? 'passed' : 'failed';
      suites[4].status = 'running';
      setTestSuites([...suites]);

      // Run System Stats tests
      setProgress(100);
      suites[4].tests = await testSystemStats();
      suites[4].status = suites[4].tests.every(t => t.status === 'passed') ? 'passed' : 'failed';
      setTestSuites([...suites]);

      // Generate test report
      generateTestReport(suites);

      toast({
        title: "Testing Complete",
        description: "All system tests have been executed. Check the results below.",
      });

    } catch (error) {
      toast({
        title: "Testing Failed",
        description: `Error during testing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateTestReport = (suites: TestSuite[]) => {
    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = suites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'passed').length, 0);
    const failedTests = suites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'failed').length, 0);
    const warningTests = suites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'warning').length, 0);

    const report = `
JNV DODDABALAPURA - SYSTEM TEST REPORT
Generated: ${new Date().toLocaleString()}
======================================

SUMMARY:
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Warnings: ${warningTests}
- Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%

STORAGE INFORMATION:
- Data stored in: Browser localStorage
- Storage key: jnv_attendance_system
- Current size: ${dataManager.getSystemStats().storageSize}
- Location: Client-side only (no server storage)

DETAILED RESULTS:
${suites.map(suite => `
${suite.name}:
${suite.tests.map(test => `  - ${test.name}: ${test.status.toUpperCase()} - ${test.message}`).join('\n')}
`).join('\n')}

RECOMMENDATIONS:
1. All data is stored locally in browser localStorage
2. Data persists between sessions but is browser-specific
3. For production, consider implementing server-side storage
4. Regular data exports recommended for backup
5. Consider implementing user authentication for security

END REPORT
    `;

    setTestResults(report);
  };

  const downloadTestReport = () => {
    if (!testResults) return;
    
    const blob = new Blob([testResults], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JNV_System_Test_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Test report has been downloaded to your device.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-netflix-red animate-spin" />;
      default: return <div className="h-4 w-4 bg-netflix-light-gray/50 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-netflix-text mb-2">System Tester</h2>
        <p className="text-netflix-muted">Comprehensive testing of data management functionality</p>
      </div>

      {/* Control Panel */}
      <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
        <CardHeader>
          <CardTitle className="text-netflix-text flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Control Panel
          </CardTitle>
          <CardDescription className="text-netflix-muted">
            Run comprehensive tests on all system functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-netflix-red hover:bg-netflix-red/90 text-white transition-netflix"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            {testResults && (
              <Button 
                onClick={downloadTestReport}
                variant="outline"
                className="bg-netflix-light-gray/20 border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/40 transition-netflix"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-netflix-muted mt-2">Testing in progress: {progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testSuites.length > 0 && (
        <div className="space-y-4">
          {testSuites.map((suite, index) => (
            <Card key={index} className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(suite.status)}
                    {suite.name}
                  </span>
                  <Badge variant={suite.status === 'passed' ? 'default' : 'destructive'}>
                    {suite.tests.length} tests
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-start justify-between p-3 bg-netflix-dark/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium text-netflix-text">{test.name}</p>
                          <p className="text-sm text-netflix-muted">{test.message}</p>
                          {test.details && (
                            <p className="text-xs text-netflix-muted mt-1 font-mono">{test.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Storage Information */}
      <Alert className="border-netflix-light-gray/20 bg-netflix-light-gray/30">
        <Database className="h-4 w-4" />
        <AlertDescription className="text-netflix-text">
          <strong>Data Storage:</strong> All data is stored in browser localStorage under key 'jnv_attendance_system'. 
          Data persists between sessions but is browser-specific. Current usage: {dataManager.getSystemStats().storageSize}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SystemTester;