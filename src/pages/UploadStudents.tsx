import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataManager } from '@/lib/dataManager';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: number;
  errors: string[];
  duplicates: string[];
}

const UploadStudents = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const validateFileType = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    return hasValidType || hasValidExtension;
  };

  const validateFileSize = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const data = lines.map(line => {
            // Handle CSV parsing with proper quote handling
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse CSV file: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processStudentData = (data: any[]): UploadResult => {
    const result: UploadResult = {
      success: 0,
      errors: [],
      duplicates: []
    };

    if (data.length < 2) {
      result.errors.push('File must contain at least a header row and one data row');
      return result;
    }

    const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
    
    // Find column indices
    const rollNoIndex = headers.findIndex((h: string) => 
      h.includes('roll') && h.includes('no') || h.includes('rollno') || h === 'roll number'
    );
    const nameIndex = headers.findIndex((h: string) => 
      h.includes('name') || h.includes('student')
    );
    const classIndex = headers.findIndex((h: string) => 
      h === 'class' || h.includes('grade')
    );
    const sectionIndex = headers.findIndex((h: string) => 
      h === 'section' || h.includes('division')
    );

    if (rollNoIndex === -1) {
      result.errors.push('Roll Number column not found. Expected column names: "Roll No", "Roll Number", or "RollNo"');
    }
    if (nameIndex === -1) {
      result.errors.push('Student Name column not found. Expected column names containing "Name" or "Student"');
    }
    if (classIndex === -1) {
      result.errors.push('Class column not found. Expected column name: "Class" or "Grade"');
    }
    if (sectionIndex === -1) {
      result.errors.push('Section column not found. Expected column name: "Section" or "Division"');
    }

    if (result.errors.length > 0) {
      return result;
    }

    const validStudents = [];
    
    // Process data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0 || row.every((cell: any) => !cell || String(cell).trim() === '')) {
        continue; // Skip empty rows
      }

      const rollNo = String(row[rollNoIndex] || '').trim();
      const name = String(row[nameIndex] || '').trim();
      const studentClass = String(row[classIndex] || '').trim();
      const section = String(row[sectionIndex] || '').trim();

      if (!rollNo) {
        result.errors.push(`Row ${i + 1}: Roll Number is required`);
        continue;
      }
      if (!name) {
        result.errors.push(`Row ${i + 1}: Student Name is required`);
        continue;
      }
      if (!studentClass) {
        result.errors.push(`Row ${i + 1}: Class is required`);
        continue;
      }
      if (!section) {
        result.errors.push(`Row ${i + 1}: Section is required`);
        continue;
      }

      const student = {
        rollNo,
        name,
        class: studentClass,
        section
      };

      // Validate student data
      const validationErrors = dataManager.validateStudentData(student);
      if (validationErrors.length > 0) {
        if (validationErrors.some(e => e.includes('already exists'))) {
          result.duplicates.push(`${rollNo} - ${name}`);
        } else {
          result.errors.push(`Row ${i + 1}: ${validationErrors.join(', ')}`);
        }
        continue;
      }

      validStudents.push(student);
    }

    // Add valid students to database
    if (validStudents.length > 0) {
      try {
        dataManager.addMultipleStudents(validStudents);
        result.success = validStudents.length;
      } catch (error) {
        result.errors.push('Failed to save students to database: ' + (error as Error).message);
      }
    }

    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadResult(null);
    setUploadStatus('idle');

    // Validate file type
    if (!validateFileType(file)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let data: any[];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = await parseCSVFile(file);
      } else {
        data = await parseExcelFile(file);
      }

      clearInterval(progressInterval);
      setUploadProgress(95);

      // Process the data
      const result = processStudentData(data);
      setUploadResult(result);

      setUploadProgress(100);

      if (result.success > 0) {
        setUploadStatus('success');
        toast({
          title: "Upload Successful",
          description: `${result.success} students added successfully.`,
        });
      } else {
        setUploadStatus('error');
        toast({
          title: "Upload Failed",
          description: "No valid student records were processed.",
          variant: "destructive",
        });
      }

    } catch (error) {
      setUploadStatus('error');
      setUploadResult({
        success: 0,
        errors: [(error as Error).message],
        duplicates: []
      });
      toast({
        title: "Processing Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template data
    const templateData = [
      ['Roll No', 'Student Name', 'Class', 'Section'],
      ['JNV001', 'Student Name 1', '8', 'A'],
      ['JNV002', 'Student Name 2', '8', 'A'],
      ['JNV003', 'Student Name 3', '8', 'B'],
      ['JNV004', 'Student Name 4', '9', 'A'],
      ['JNV005', 'Student Name 5', '9', 'B'],
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // Roll No
      { width: 25 }, // Student Name
      { width: 10 }, // Class
      { width: 10 }, // Section
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    // Generate and download file
    XLSX.writeFile(wb, 'student_list_template.xlsx');

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your device.",
    });
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
            Please use the provided Excel template to ensure proper data formatting. 
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
            <CardDescription className="text-netflix-muted">Get the Excel template with the correct format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2 bg-netflix-light-gray/20 border-netflix-light-gray text-netflix-text hover:bg-netflix-light-gray/40 transition-netflix"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel Template
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
                      {uploadedFile ? (
                        <span className="flex items-center gap-2">
                          {uploadedFile.name}
                          {!isUploading && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                clearUpload();
                              }}
                              className="text-netflix-muted hover:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </span>
                      ) : (
                        'Click to upload CSV/Excel file'
                      )}
                    </p>
                    <p className="text-sm text-netflix-muted">
                      Supports .xlsx, .xls, and .csv files (Max 5MB)
                    </p>
                  </div>
                  {!isUploading && !uploadedFile && (
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
                    <span className="text-sm font-medium text-netflix-text">Processing file...</span>
                    <span className="text-sm text-netflix-muted">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Results */}
              {uploadResult && (
                <div className="space-y-4">
                  {uploadStatus === 'success' && uploadResult.success > 0 && (
                    <Alert className="border-green-500/20 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        Successfully added {uploadResult.success} students to the system!
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResult.duplicates.length > 0 && (
                    <Alert className="border-yellow-500/20 bg-yellow-500/10">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-yellow-400">
                        <strong>Duplicate entries skipped ({uploadResult.duplicates.length}):</strong>
                        <ul className="mt-2 text-sm">
                          {uploadResult.duplicates.slice(0, 5).map((dup, index) => (
                            <li key={index}>• {dup}</li>
                          ))}
                          {uploadResult.duplicates.length > 5 && (
                            <li>• ... and {uploadResult.duplicates.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResult.errors.length > 0 && (
                    <Alert className="border-destructive/20 bg-destructive/10">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        <strong>Errors found ({uploadResult.errors.length}):</strong>
                        <ul className="mt-2 text-sm max-h-32 overflow-y-auto">
                          {uploadResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {uploadResult.errors.length > 10 && (
                            <li>• ... and {uploadResult.errors.length - 10} more errors</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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
                  <li>• <strong>Roll No</strong> - Unique student identifier</li>
                  <li>• <strong>Student Name</strong> - Full name of student</li>
                  <li>• <strong>Class</strong> - Grade level (e.g., 8, 9, 10)</li>
                  <li>• <strong>Section</strong> - Class section (e.g., A, B, C)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-netflix-text">File Requirements:</h4>
                <ul className="space-y-1 text-sm text-netflix-muted">
                  <li>• <strong>Format:</strong> Excel (.xlsx, .xls) or CSV</li>
                  <li>• <strong>Size:</strong> Maximum 5 MB</li>
                  <li>• <strong>Structure:</strong> First row must be headers</li>
                  <li>• <strong>Data:</strong> No empty rows between records</li>
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