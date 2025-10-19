import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export const employeeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(employee: EmployeeInsert) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: EmployeeUpdate) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getByDepartment(department: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('department', department)
      .order('name');

    if (error) throw error;
    return data;
  },

  async getActiveEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data;
  },

  async searchEmployees(query: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`)
      .order('name');

    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
