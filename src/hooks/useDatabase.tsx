import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface Student {
  id: string;
  roll_no: string;
  full_name: string;
  class: string;
  section: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  department?: string;
  subject?: string;
  classes?: string[];
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  present: boolean;
  class_name: string;
  created_at: string;
}

export const useDatabase = () => {
  const { user, session } = useSupabaseAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    if (!session) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    if (!session) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching teachers:', error);
    } else {
      setTeachers(data || []);
    }
    setLoading(false);
  };

  // Add student
  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!session) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) throw error;
    
    setStudents(prev => [data, ...prev]);
    return data;
  };

  // Add multiple students
  const addMultipleStudents = async (studentsData: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (!session) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('students')
      .insert(studentsData)
      .select();
    
    if (error) throw error;
    
    setStudents(prev => [...(data || []), ...prev]);
    return data;
  };

  // Delete student
  const deleteStudent = async (id: string) => {
    if (!session) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Add teacher (sign up new user)
  const addTeacher = async (teacherData: {
    email: string;
    password: string;
    full_name: string;
    role: 'teacher' | 'principal';
    department?: string;
    subject?: string;
    classes?: string[];
  }) => {
    const { email, password, ...profileData } = teacherData;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData
      }
    });
    
    if (error) throw error;
    
    return data;
  };

  // Get current user profile
  const getCurrentUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  };

  // Validate student data
  const validateStudentData = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    const errors: string[] = [];
    
    if (!studentData.roll_no?.trim()) errors.push('Roll number is required');
    if (!studentData.full_name?.trim()) errors.push('Student name is required');
    if (!studentData.class?.trim()) errors.push('Class is required');
    if (!studentData.section?.trim()) errors.push('Section is required');
    
    // Check for duplicate roll numbers
    if (studentData.roll_no?.trim()) {
      const { data } = await supabase
        .from('students')
        .select('id')
        .eq('roll_no', studentData.roll_no.trim())
        .limit(1);
      
      if (data && data.length > 0) {
        errors.push('Roll number already exists');
      }
    }
    
    return errors;
  };

  // Get pending approvals (admin only)
  const getPendingApprovals = async () => {
    if (!session) return [];
    
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('processed', false)
      .order('requested_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
    
    return data || [];
  };

  // Approve user (admin only)
  const approveUser = async (profileId: string) => {
    if (!session) throw new Error('Not authenticated');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', profileId);
    
    if (profileError) throw profileError;
    
    const { error: approvalError } = await supabase
      .from('pending_approvals')
      .update({ processed: true })
      .eq('profile_id', profileId);
    
    if (approvalError) throw approvalError;
  };

  // Reject user (admin only)
  const rejectUser = async (profileId: string) => {
    if (!session) throw new Error('Not authenticated');
    
    const { error: approvalError } = await supabase
      .from('pending_approvals')
      .update({ processed: true })
      .eq('profile_id', profileId);
    
    if (approvalError) throw approvalError;
    
    // Optionally delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);
    
    if (profileError) throw profileError;
  };

  // Send admin notification email
  const sendAdminNotification = async (userEmail: string, fullName: string, role: string, profileId: string) => {
    try {
      const { error } = await supabase.functions.invoke('notify-admin-new-user', {
        body: { userEmail, fullName, role, profileId }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't throw error - registration should still work even if email fails
    }
  };

  // Get system stats
  const getSystemStats = async () => {
    if (!session) return null;
    
    try {
      const [studentsCount, teachersCount, pendingCount] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('approved', true),
        supabase.from('pending_approvals').select('id', { count: 'exact', head: true }).eq('processed', false)
      ]);
      
      const classes = [...new Set(students.map(s => `${s.class}-${s.section}`))];
      
      return {
        totalStudents: studentsCount.count || 0,
        totalTeachers: teachersCount.count || 0,
        totalClasses: classes.length,
        pendingApprovals: pendingCount.count || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        pendingApprovals: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  };

  // Load data when user session changes
  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchTeachers();
    }
  }, [session]);

  return {
    students,
    teachers,
    loading,
    addStudent,
    addMultipleStudents,
    deleteStudent,
    addTeacher,
    validateStudentData,
    getCurrentUserProfile,
    getSystemStats,
    getPendingApprovals,
    approveUser,
    rejectUser,
    sendAdminNotification,
    fetchStudents,
    fetchTeachers
  };
};