import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataManager } from '@/lib/dataManager';

const UploadStudents = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    // Process the uploaded file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.csv')) {
          // Process CSV file
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Validate headers
          const requiredHeaders = ['Roll No', 'Student Name', 'Class', 'Section'];
          const hasValidHeaders = requiredHeaders.every(header => 
            headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
          );
          
          if (!hasValidHeaders) {
            setUploadStatus('error');
            toast({
              title: "Invalid File Format",
              description: "CSV must contain columns: Roll No, Student Name, Class, Section",
              variant: "destructive",
            });
            return;
          }
          
          // Process student data
          const students = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 4 && values[0] && values[1]) {
              const student = {
                rollNo: values[0],
                name: values[1],
                class: values[2],
                section: values[3]
              };
              
              // Validate student data
              const errors = dataManager.validateStudentData(student);
              if (errors.length === 0) {
                students.push(student);
              }
            }
          }
          
          // Add students to database
          if (students.length > 0) {
            dataManager.addMultipleStudents(students);
            setUploadStatus('success');
            toast({
              title: "Upload Successful",
              description: `${students.length} students added to the system.`,
            });
          } else {
            setUploadStatus('error');
            toast({
              title: "No Valid Data",
              description: "No valid student records found in the file.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setUploadStatus('error');
        toast({
          title: "Processing Error",
          description: "Error processing the uploaded file.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      setUploadStatus('error');
      toast({
        title: "File Read Error",
        description: "Error reading the uploaded file.",
        variant: "destructive",
      });
    };

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          reader.readAsText(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Set final status after processing
    setTimeout(() => {
      setIsUploading(false);
    }, 1500);
  };

  const downloadTemplate = () => {
    // Create a sample Excel template data
    const templateData = [
      ['Roll No', 'Student Name', 'Class', 'Section'],
      ['JNV001', 'Student Name 1', '8', 'A'],
      ['JNV002', 'Student Name 2', '8', 'A'],
      ['JNV003', 'Student Name 3', '8', 'B'],
      ['', '', '', ''], // Empty row for user to fill
    ];

    // Convert to CSV format
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_list_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device.",
    });
  };

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-netflix-text mb-2">Upload Student List</h1>
          <p className="text-netflix-muted">Upload your class student list using CSV/Excel</p>
        </div>

        {/* Instructions */}
        <Alert className="border-netflix-light-gray/20 bg-netflix-light-gray/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-netflix-text">
            Please use the provided CSV template to ensure proper data formatting. 
            Required columns: Roll No, Student Name, Class, Section.
          </AlertDescription>
        </Alert>

        {/* Template Download */}
        <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
          <CardHeader>
            <CardTitle className="text-netflix-text flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription className="text-netflix-muted">Get the CSV template with the correct format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2 bg-netflix-light-gray/20 border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/40 transition-netflix"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
          <CardHeader>
            <CardTitle className="text-netflix-text flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Student List
            </CardTitle>
            <CardDescription className="text-netflix-muted">Select your CSV/Excel file to upload student data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-netflix-light-gray/50 rounded-lg p-8 text-center hover:border-netflix-red/50 transition-netflix">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-netflix-light-gray/30 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-netflix-red" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-netflix-text">
                      {uploadedFile ? uploadedFile.name : 'Click to upload CSV/Excel file'}
                    </p>
                    <p className="text-sm text-netflix-muted">
                      Supports .xlsx, .xls, and .csv files (Max 5MB)
                    </p>
                  </div>
                  {!isUploading && (
                    <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white transition-netflix">
                      Choose File
                    </Button>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-netflix-text">Uploading...</span>
                    <span className="text-sm text-netflix-muted">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-400">
                    File uploaded successfully! Student data has been processed and saved.
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'error' && (
                <Alert className="border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Upload failed. Please check the file format and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Guidelines */}
        <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
          <CardHeader>
            <CardTitle className="text-netflix-text">Upload Guidelines</CardTitle>
            <CardDescription className="text-netflix-muted">Follow these guidelines for successful upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-netflix-text">Required Columns:</h4>
                <ul className="space-y-1 text-sm text-netflix-muted">
                  <li>• Roll Number (unique identifier)</li>
                  <li>• Student Name (full name)</li>
                  <li>• Class (e.g., 8, 9, 10)</li>
                  <li>• Section (e.g., A, B, C)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-netflix-text">File Requirements:</h4>
                <ul className="space-y-1 text-sm text-netflix-muted">
                  <li>• Format: CSV, Excel (.xlsx or .xls)</li>
                  <li>• Maximum size: 5 MB</li>
                  <li>• No empty rows between data</li>
                  <li>• Headers must match template</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadStudents;