import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];
type WorkSessionInsert = Database['public']['Tables']['work_sessions']['Insert'];
type WorkSessionUpdate = Database['public']['Tables']['work_sessions']['Update'];

export const workSessionService = {
  async getActiveSessions(employeeId?: string) {
    let query = supabase
      .from('work_sessions')
      .select(`
        *,
        employee:employees(id, name, email, department)
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getSessionsByEmployee(employeeId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('work_sessions')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_time', { ascending: false });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getSessionById(id: string) {
    const { data, error } = await supabase
      .from('work_sessions')
      .select(`
        *,
        employee:employees(id, name, email, department)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createSession(session: WorkSessionInsert) {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSession(id: string, updates: WorkSessionUpdate) {
    const { data, error } = await supabase
      .from('work_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async startSession(employeeId: string) {
    const activeSession = await this.getActiveSessions(employeeId);

    if (activeSession && activeSession.length > 0) {
      throw new Error('An active session already exists');
    }

    const session: WorkSessionInsert = {
      employee_id: employeeId,
      start_time: new Date().toISOString(),
      status: 'active',
      session_type: 'work',
      total_minutes: 0,
    };

    return this.createSession(session);
  },

  async pauseSession(id: string) {
    const session = await this.getSessionById(id);
    if (!session) throw new Error('Session not found');

    const now = new Date();
    const start = new Date(session.start_time);
    const minutes = Math.floor((now.getTime() - start.getTime()) / 60000);

    return this.updateSession(id, {
      status: 'paused',
      total_minutes: minutes,
    });
  },

  async resumeSession(id: string) {
    return this.updateSession(id, {
      status: 'active',
      start_time: new Date().toISOString(),
    });
  },

  async endSession(id: string) {
    const session = await this.getSessionById(id);
    if (!session) throw new Error('Session not found');

    const now = new Date();
    const start = new Date(session.start_time);
    const minutes = Math.floor((now.getTime() - start.getTime()) / 60000);

    return this.updateSession(id, {
      status: 'completed',
      end_time: now.toISOString(),
      total_minutes: session.total_minutes + minutes,
    });
  },

  async getTodayHours(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('work_sessions')
      .select('total_minutes')
      .eq('employee_id', employeeId)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString());

    if (error) throw error;

    const totalMinutes = data?.reduce((sum, session) => sum + (session.total_minutes || 0), 0) || 0;
    return totalMinutes / 60;
  },

  async getMonthlyHours(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('work_sessions')
      .select('total_minutes, start_time')
      .eq('employee_id', employeeId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (error) throw error;

    const totalMinutes = data?.reduce((sum, session) => sum + (session.total_minutes || 0), 0) || 0;
    return {
      totalHours: totalMinutes / 60,
      sessions: data?.length || 0,
    };
  },

  subscribeToChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('work-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
