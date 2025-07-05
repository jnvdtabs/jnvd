import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadStatus('success');
          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded successfully.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // In a real app, this would download the actual template file
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your device.",
    });
  };

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-education-dark mb-2">Upload Student List</h1>
          <p className="text-muted-foreground">Upload your class student list using Excel</p>
        </div>

        {/* Instructions */}
        <Alert className="border-education-blue/20 bg-education-light/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please use the provided Excel template to ensure proper data formatting. 
            Required columns: Roll No, Student Name, Class, Section.
          </AlertDescription>
        </Alert>

        {/* Template Download */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="text-education-dark flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>Get the Excel template with the correct format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="text-education-dark flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Student List
            </CardTitle>
            <CardDescription>Select your Excel file to upload student data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-education-light rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-education-blue" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-education-dark">
                      {uploadedFile ? uploadedFile.name : 'Click to upload Excel file'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .xlsx and .xls files (Max 5MB)
                    </p>
                  </div>
                  {!isUploading && (
                    <Button className="bg-gradient-primary hover:opacity-90 text-white">
                      Choose File
                    </Button>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <Alert className="border-education-green/20 bg-education-green/10">
                  <CheckCircle className="h-4 w-4 text-education-green" />
                  <AlertDescription className="text-education-green">
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
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="text-education-dark">Upload Guidelines</CardTitle>
            <CardDescription>Follow these guidelines for successful upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-education-dark">Required Columns:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Roll Number (unique identifier)</li>
                  <li>• Student Name (full name)</li>
                  <li>• Class (e.g., 8, 9, 10)</li>
                  <li>• Section (e.g., A, B, C)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-education-dark">File Requirements:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Format: Excel (.xlsx or .xls)</li>
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