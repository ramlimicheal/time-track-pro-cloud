import type { Tables, Enums } from "@/integrations/supabase/types";

export type ProfileRow = Tables<"profiles">;
export type TimeRecord = Tables<"timesheets">;
export type LeaveRecord = Tables<"leave_applications">;
export type LeaveBalance = Tables<"leave_balances">;
export type AppRole = Enums<"app_role">;
export type LeaveType = Enums<"leave_type">;
export type TimeStatus = Enums<"timesheet_status">;

export interface TimeEntryInput {
  work_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  ot_start: string;
  ot_end: string;
  description: string;
}

export interface LeaveInput {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
}

export type ProfileInput = Pick<ProfileRow, "full_name" | "department" | "position" | "phone">;
