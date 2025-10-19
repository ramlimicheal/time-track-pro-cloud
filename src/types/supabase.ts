export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'employee' | 'manager' | 'admin'
          employee_id: string | null
          full_name: string
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'employee' | 'manager' | 'admin'
          employee_id?: string | null
          full_name: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'employee' | 'manager' | 'admin'
          employee_id?: string | null
          full_name?: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone_number: string | null
          department_id: string | null
          department: string | null
          position: string
          join_date: string
          status: 'active' | 'inactive' | 'on_leave' | 'terminated'
          dob: string | null
          blood_group: string | null
          passport_number: string | null
          indian_address: string | null
          oman_address: string | null
          emergency_phone_number: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone_number?: string | null
          department_id?: string | null
          department?: string | null
          position: string
          join_date: string
          status?: 'active' | 'inactive' | 'on_leave' | 'terminated'
          dob?: string | null
          blood_group?: string | null
          passport_number?: string | null
          indian_address?: string | null
          oman_address?: string | null
          emergency_phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone_number?: string | null
          department_id?: string | null
          department?: string | null
          position?: string
          join_date?: string
          status?: 'active' | 'inactive' | 'on_leave' | 'terminated'
          dob?: string | null
          blood_group?: string | null
          passport_number?: string | null
          indian_address?: string | null
          oman_address?: string | null
          emergency_phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timesheets: {
        Row: {
          id: string
          employee_id: string
          month: number
          year: number
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          submitted_at: string | null
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month: number
          year: number
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month?: number
          year?: number
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timesheet_entries: {
        Row: {
          id: string
          timesheet_id: string
          date: string
          work_start: string | null
          work_end: string | null
          break_start: string | null
          break_end: string | null
          ot_start: string | null
          ot_end: string | null
          total_hours: number
          description: string | null
          remarks: string | null
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          timesheet_id: string
          date: string
          work_start?: string | null
          work_end?: string | null
          break_start?: string | null
          break_end?: string | null
          ot_start?: string | null
          ot_end?: string | null
          total_hours?: number
          description?: string | null
          remarks?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          timesheet_id?: string
          date?: string
          work_start?: string | null
          work_end?: string | null
          break_start?: string | null
          break_end?: string | null
          ot_start?: string | null
          ot_end?: string | null
          total_hours?: number
          description?: string | null
          remarks?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      work_sessions: {
        Row: {
          id: string
          employee_id: string
          start_time: string
          end_time: string | null
          total_minutes: number
          status: 'active' | 'paused' | 'completed'
          session_type: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_time: string
          end_time?: string | null
          total_minutes?: number
          status?: 'active' | 'paused' | 'completed'
          session_type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_time?: string
          end_time?: string | null
          total_minutes?: number
          status?: 'active' | 'paused' | 'completed'
          session_type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_applications: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          start_date: string
          end_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          days_count: number
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          start_date: string
          end_date: string
          reason: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          days_count: number
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          start_date?: string
          end_date?: string
          reason?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          days_count?: number
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_balances: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          total_days: number
          used_days: number
          remaining_days: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          total_days?: number
          used_days?: number
          remaining_days?: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
          total_days?: number
          used_days?: number
          remaining_days?: number
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          employee_id: string
          activity_type: string
          activity_details: string | null
          status: string | null
          work_hours: number | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          activity_type: string
          activity_details?: string | null
          status?: string | null
          work_hours?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          activity_type?: string
          activity_details?: string | null
          status?: string | null
          work_hours?: number | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
      }
      audit_trail: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'employee' | 'manager' | 'admin'
      timesheet_status: 'draft' | 'pending' | 'approved' | 'rejected'
      leave_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
      leave_type: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity'
      session_status: 'active' | 'paused' | 'completed'
      employee_status: 'active' | 'inactive' | 'on_leave' | 'terminated'
    }
  }
}
