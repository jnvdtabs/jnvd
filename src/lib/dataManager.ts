// Comprehensive Data Management System for Attendance App
// Data is stored in localStorage for persistence

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  dateAdded: string;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password: string;
  subject: string;
  classes: string[];
  dateAdded: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
  teacherId: string;
  className: string;
}

export interface SystemData {
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  lastExport: string;
  systemStats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    lastUpdated: string;
  };
}

class DataManager {
  private storageKey = 'jnv_attendance_system';

  // Initialize with default admin user
  private defaultData: SystemData = {
    students: [],
    teachers: [
      {
        id: 'admin-001',
        name: 'System Administrator',
        username: 'ADMIN',
        password: 'ADMIN',
        subject: 'Administration',
        classes: ['ALL'],
        dateAdded: new Date().toISOString()
      }
    ],
    attendance: [],
    lastExport: '',
    systemStats: {
      totalStudents: 0,
      totalTeachers: 1,
      totalClasses: 0,
      lastUpdated: new Date().toISOString()
    }
  };

  // Get all data from localStorage
  getData(): SystemData {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      this.saveData(this.defaultData);
      return this.defaultData;
    }
    return JSON.parse(stored);
  }

  // Save data to localStorage
  saveData(data: SystemData): void {
    data.systemStats.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Clear all data and reset to defaults
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    this.saveData(this.defaultData);
  }

  // Student Management
  addStudent(student: Omit<Student, 'id' | 'dateAdded'>): Student {
    const data = this.getData();
    const newStudent: Student = {
      ...student,
      id: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString()
    };
    
    data.students.push(newStudent);
    data.systemStats.totalStudents = data.students.length;
    this.saveData(data);
    return newStudent;
  }

  addMultipleStudents(students: Omit<Student, 'id' | 'dateAdded'>[]): Student[] {
    const data = this.getData();
    const newStudents: Student[] = students.map(student => ({
      ...student,
      id: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString()
    }));
    
    data.students.push(...newStudents);
    data.systemStats.totalStudents = data.students.length;
    this.saveData(data);
    return newStudents;
  }

  getStudents(): Student[] {
    return this.getData().students;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const data = this.getData();
    const index = data.students.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    data.students[index] = { ...data.students[index], ...updates };
    this.saveData(data);
    return data.students[index];
  }

  deleteStudent(id: string): boolean {
    const data = this.getData();
    const initialLength = data.students.length;
    data.students = data.students.filter(s => s.id !== id);
    
    if (data.students.length < initialLength) {
      // Also remove attendance records for this student
      data.attendance = data.attendance.filter(a => a.studentId !== id);
      data.systemStats.totalStudents = data.students.length;
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Teacher Management
  addTeacher(teacher: Omit<Teacher, 'id' | 'dateAdded'>): Teacher {
    const data = this.getData();
    const newTeacher: Teacher = {
      ...teacher,
      id: `TCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString()
    };
    
    data.teachers.push(newTeacher);
    data.systemStats.totalTeachers = data.teachers.length;
    this.saveData(data);
    return newTeacher;
  }

  getTeachers(): Teacher[] {
    return this.getData().teachers;
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    const data = this.getData();
    const index = data.teachers.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    data.teachers[index] = { ...data.teachers[index], ...updates };
    this.saveData(data);
    return data.teachers[index];
  }

  deleteTeacher(id: string): boolean {
    const data = this.getData();
    const initialLength = data.teachers.length;
    data.teachers = data.teachers.filter(t => t.id !== id);
    
    if (data.teachers.length < initialLength) {
      data.systemStats.totalTeachers = data.teachers.length;
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Attendance Management
  markAttendance(records: Omit<AttendanceRecord, 'id'>[]): AttendanceRecord[] {
    const data = this.getData();
    const newRecords: AttendanceRecord[] = records.map(record => ({
      ...record,
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Remove existing records for same date/class to avoid duplicates
    data.attendance = data.attendance.filter(a => 
      !(a.date === records[0]?.date && a.className === records[0]?.className)
    );
    
    data.attendance.push(...newRecords);
    this.saveData(data);
    return newRecords;
  }

  getAttendance(filters?: {
    date?: string;
    studentId?: string;
    className?: string;
    teacherId?: string;
  }): AttendanceRecord[] {
    let attendance = this.getData().attendance;
    
    if (filters) {
      if (filters.date) attendance = attendance.filter(a => a.date === filters.date);
      if (filters.studentId) attendance = attendance.filter(a => a.studentId === filters.studentId);
      if (filters.className) attendance = attendance.filter(a => a.className === filters.className);
      if (filters.teacherId) attendance = attendance.filter(a => a.teacherId === filters.teacherId);
    }
    
    return attendance;
  }

  // Data Export/Import
  exportToCSV(type: 'students' | 'teachers' | 'attendance' | 'all'): string {
    const data = this.getData();
    let csvContent = '';
    
    switch (type) {
      case 'students':
        csvContent = 'Roll No,Student Name,Class,Section,Date Added\n';
        csvContent += data.students.map(s => 
          `${s.rollNo},${s.name},${s.class},${s.section},${s.dateAdded}`
        ).join('\n');
        break;
        
      case 'teachers':
        csvContent = 'Name,Username,Subject,Classes,Date Added\n';
        csvContent += data.teachers.map(t => 
          `${t.name},${t.username},${t.subject},"${t.classes.join(', ')}",${t.dateAdded}`
        ).join('\n');
        break;
        
      case 'attendance':
        csvContent = 'Date,Roll No,Student Name,Class,Present,Teacher\n';
        csvContent += data.attendance.map(a => {
          const student = data.students.find(s => s.id === a.studentId);
          const teacher = data.teachers.find(t => t.id === a.teacherId);
          return `${a.date},${student?.rollNo || 'N/A'},${student?.name || 'N/A'},${a.className},${a.present ? 'Yes' : 'No'},${teacher?.name || 'N/A'}`;
        }).join('\n');
        break;
        
      case 'all':
        const date = new Date().toISOString().split('T')[0];
        csvContent = `JNV Doddabalapura - Complete System Export - ${date}\n\n`;
        csvContent += this.exportToCSV('students') + '\n\n';
        csvContent += this.exportToCSV('teachers') + '\n\n';
        csvContent += this.exportToCSV('attendance');
        break;
    }
    
    data.lastExport = new Date().toISOString();
    this.saveData(data);
    return csvContent;
  }

  downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Validation and Error Handling
  validateStudentData(student: Omit<Student, 'id' | 'dateAdded'>): string[] {
    const errors: string[] = [];
    const data = this.getData();
    
    if (!student.rollNo.trim()) errors.push('Roll number is required');
    if (!student.name.trim()) errors.push('Student name is required');
    if (!student.class.trim()) errors.push('Class is required');
    if (!student.section.trim()) errors.push('Section is required');
    
    // Check for duplicate roll numbers
    if (data.students.some(s => s.rollNo.toLowerCase() === student.rollNo.toLowerCase())) {
      errors.push('Roll number already exists');
    }
    
    return errors;
  }

  validateTeacherData(teacher: Omit<Teacher, 'id' | 'dateAdded'>): string[] {
    const errors: string[] = [];
    const data = this.getData();
    
    if (!teacher.name.trim()) errors.push('Teacher name is required');
    if (!teacher.username.trim()) errors.push('Username is required');
    if (!teacher.password.trim()) errors.push('Password is required');
    if (!teacher.subject.trim()) errors.push('Subject is required');
    
    // Check for duplicate usernames
    if (data.teachers.some(t => t.username.toLowerCase() === teacher.username.toLowerCase())) {
      errors.push('Username already exists');
    }
    
    return errors;
  }

  // System Statistics
  getSystemStats() {
    const data = this.getData();
    const classes = [...new Set(data.students.map(s => `${s.class}-${s.section}`))];
    
    return {
      ...data.systemStats,
      totalClasses: classes.length,
      totalAttendanceRecords: data.attendance.length,
      storageSize: this.getStorageSize(),
      lastExport: data.lastExport || 'Never'
    };
  }

  private getStorageSize(): string {
    const data = JSON.stringify(this.getData());
    const sizeInBytes = new Blob([data]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return `${sizeInKB} KB`;
  }

  // Search functionality
  searchStudents(query: string): Student[] {
    const students = this.getStudents();
    const searchTerm = query.toLowerCase().trim();
    
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm) ||
      student.rollNo.toLowerCase().includes(searchTerm) ||
      student.class.toLowerCase().includes(searchTerm) ||
      student.section.toLowerCase().includes(searchTerm)
    );
  }
}

// Export singleton instance
export const dataManager = new DataManager();