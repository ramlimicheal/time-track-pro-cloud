import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Timesheet = Database['public']['Tables']['timesheets']['Row'];
type TimesheetInsert = Database['public']['Tables']['timesheets']['Insert'];
type TimesheetUpdate = Database['public']['Tables']['timesheets']['Update'];
type TimesheetEntry = Database['public']['Tables']['timesheet_entries']['Row'];
type TimesheetEntryInsert = Database['public']['Tables']['timesheet_entries']['Insert'];
type TimesheetEntryUpdate = Database['public']['Tables']['timesheet_entries']['Update'];

export const timesheetService = {
  async getTimesheets(employeeId?: string, status?: string) {
    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, name, email, department, position)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

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

  async getTimesheetById(id: string) {
    const { data, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, name, email, department, position),
        entries:timesheet_entries(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTimesheetByMonthYear(employeeId: string, month: number, year: number) {
    const { data, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        entries:timesheet_entries(*)
      `)
      .eq('employee_id', employeeId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTimesheet(timesheet: TimesheetInsert) {
    const { data, error } = await supabase
      .from('timesheets')
      .insert(timesheet)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTimesheet(id: string, updates: TimesheetUpdate) {
    const { data, error } = await supabase
      .from('timesheets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitTimesheet(id: string) {
    const { data, error } = await supabase
      .from('timesheets')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveTimesheet(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('timesheets')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('timesheet_entries')
      .update({ status: 'approved' })
      .eq('timesheet_id', id);

    return data;
  },

  async rejectTimesheet(id: string, reason: string) {
    const { data, error } = await supabase
      .from('timesheets')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('timesheet_entries')
      .update({ status: 'rejected' })
      .eq('timesheet_id', id);

    return data;
  },

  async getTimesheetEntries(timesheetId: string) {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('timesheet_id', timesheetId)
      .order('date');

    if (error) throw error;
    return data;
  },

  async createTimesheetEntry(entry: TimesheetEntryInsert) {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTimesheetEntry(id: string, updates: TimesheetEntryUpdate) {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTimesheetEntry(id: string) {
    const { error } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPendingTimesheets() {
    const { data, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, name, email, department, position)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('timesheets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timesheets',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
