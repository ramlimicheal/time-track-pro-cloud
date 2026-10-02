import { supabase } from "@/lib/supabase";
import type { TimeEntryInput, TimeRecord } from "@/types/cloud";
import { totalTimeHours, validateTimeInput } from "@/utils/cloudTime";
import { fetchAll } from "./pagination";

export const timesheetService = {
  list(userId?: string): Promise<TimeRecord[]> {
    return fetchAll((from, to) => {
      let query = supabase.from("timesheets").select("*")
        .order("work_date", { ascending: false }).order("id").range(from, to);
      if (userId) query = query.eq("user_id", userId);
      return query;
    });
  },

  async submit(userId: string, input: TimeEntryInput, existing?: TimeRecord): Promise<TimeRecord> {
    const errors = validateTimeInput(input);
    if (errors.length) throw new Error(errors.join(" "));
    if (existing && (existing.user_id !== userId || !["draft", "rejected"].includes(existing.status))) {
      throw new Error("Only your draft or rejected entries can be edited.");
    }
    const values = {
      user_id: userId, work_date: input.work_date,
      start_time: input.start_time, end_time: input.end_time,
      break_minutes: input.break_minutes, ot_start: input.ot_start || null,
      ot_end: input.ot_end || null, description: input.description.trim() || null,
      total_hours: totalTimeHours(input), status: "pending" as const,
      approved_at: null, approved_by: null, rejection_reason: null,
    };
    // Updating by version prevents an old tab from overwriting a manager decision.
    const query = existing
      ? supabase.from("timesheets").update(values).eq("id", existing.id)
        .eq("user_id", userId).eq("updated_at", existing.updated_at).in("status", ["draft", "rejected"])
      : supabase.from("timesheets").insert(values);
    const { data, error } = await query.select().single();
    if (error) {
      if (error.code === "23505") throw new Error("An entry already exists for this date. Open it from history.");
      if (error.code === "PGRST116") throw new Error("This entry changed. Refresh before editing.");
      throw error;
    }
    return data;
  },

  async review(record: TimeRecord, status: "approved" | "rejected", reason = ""): Promise<TimeRecord> {
    if (record.status !== "pending") throw new Error("Only pending entries can be reviewed.");
    if (status === "rejected" && !reason.trim()) throw new Error("A rejection reason is required.");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("Please sign in again.");
    if (user.id === record.user_id) throw new Error("You cannot approve or reject your own entry.");
    const { data, error } = await supabase.from("timesheets").update({
      status, approved_by: status === "approved" ? user.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      rejection_reason: status === "rejected" ? reason.trim() : null,
    }).eq("id", record.id).eq("updated_at", record.updated_at).eq("status", "pending").select().single();
    if (error) {
      if (error.code === "PGRST116") throw new Error("This entry changed or was already reviewed. Refresh the list.");
      throw error;
    }
    return data;
  },
};
