import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type LeaveApplication = Database['public']['Tables']['leave_applications']['Row'];
type LeaveApplicationInsert = Database['public']['Tables']['leave_applications']['Insert'];
type LeaveApplicationUpdate = Database['public']['Tables']['leave_applications']['Update'];
type LeaveBalance = Database['public']['Tables']['leave_balances']['Row'];
type LeaveBalanceInsert = Database['public']['Tables']['leave_balances']['Insert'];
type LeaveBalanceUpdate = Database['public']['Tables']['leave_balances']['Update'];

export const leaveService = {
  async getLeaveApplications(employeeId?: string, status?: string) {
    let query = supabase
      .from('leave_applications')
      .select(`
        *,
        employee:employees(id, name, email, department, position)
      `)
      .order('created_at', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getLeaveApplicationById(id: string) {
    const { data, error } = await supabase
      .from('leave_applications')
      .select(`
        *,
        employee:employees(id, name, email, department, position)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createLeaveApplication(application: LeaveApplicationInsert) {
    const { data, error } = await supabase
      .from('leave_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeaveApplication(id: string, updates: LeaveApplicationUpdate) {
    const { data, error } = await supabase
      .from('leave_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveLeaveApplication(id: string, approvedBy: string) {
    const application = await this.getLeaveApplicationById(id);
    if (!application) throw new Error('Leave application not found');

    const { data, error } = await supabase
      .from('leave_applications')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const year = new Date().getFullYear();
    const balance = await this.getLeaveBalance(
      application.employee_id,
      application.leave_type,
      year
    );

    if (balance) {
      await this.updateLeaveBalance(balance.id, {
        used_days: balance.used_days + application.days_count,
        remaining_days: balance.remaining_days - application.days_count,
      });
    }

    return data;
  },

  async rejectLeaveApplication(id: string, reason: string) {
    const { data, error } = await supabase
      .from('leave_applications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPendingLeaveApplications() {
    const { data, error } = await supabase
      .from('leave_applications')
      .select(`
        *,
        employee:employees(id, name, email, department, position)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLeaveBalance(employeeId: string, leaveType: string, year: number) {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type', leaveType)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLeaveBalances(employeeId: string, year?: number) {
    let query = supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId);

    if (year) {
      query = query.eq('year', year);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createLeaveBalance(balance: LeaveBalanceInsert) {
    const { data, error } = await supabase
      .from('leave_balances')
      .insert(balance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeaveBalance(id: string, updates: LeaveBalanceUpdate) {
    const { data, error } = await supabase
      .from('leave_balances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async initializeLeaveBalances(employeeId: string, year: number) {
    const leaveTypes: Array<'annual' | 'sick' | 'emergency'> = ['annual', 'sick', 'emergency'];
    const defaultDays: Record<string, number> = {
      annual: 30,
      sick: 15,
      emergency: 5,
    };

    const balances = leaveTypes.map((type) => ({
      employee_id: employeeId,
      leave_type: type,
      total_days: defaultDays[type],
      used_days: 0,
      remaining_days: defaultDays[type],
      year,
    }));

    const { data, error } = await supabase
      .from('leave_balances')
      .insert(balances)
      .select();

    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('leave-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_applications',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
