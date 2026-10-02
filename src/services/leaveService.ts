import { supabase } from "@/lib/supabase";
import type { LeaveInput, LeaveRecord, LeaveBalance } from "@/types/cloud";
import { leaveDays } from "@/utils/cloudTime";
import { fetchAll } from "./pagination";

export const leaveService = {
  list(userId?: string): Promise<LeaveRecord[]> {
    return fetchAll((from, to) => {
      let query = supabase.from("leave_applications").select("*")
        .order("created_at", { ascending: false }).order("id").range(from, to);
      if (userId) query = query.eq("user_id", userId);
      return query;
    });
  },

  async balances(userId: string, year: number): Promise<LeaveBalance | null> {
    const { data, error } = await supabase.from("leave_balances").select("*")
      .eq("user_id", userId).eq("year", year).maybeSingle();
    if (error) throw error;
    return data;
  },

  async setEntitlement(userId: string, year: number, days: Pick<LeaveBalance, "annual" | "sick" | "casual">): Promise<void> {
    if (!Number.isInteger(year) || year < 2020 || year > 2100 ||
        Object.values(days).some(value => !Number.isInteger(value) || value < 0 || value > 366)) {
      throw new Error("Use a valid year and whole-day entitlements between 0 and 366.");
    }
    const { error } = await supabase.from("leave_balances").upsert({ user_id: userId, year, ...days }, { onConflict: "user_id,year" });
    if (error) throw error;
  },

  async submit(userId: string, input: LeaveInput): Promise<LeaveRecord> {
    const days = leaveDays(input.start_date, input.end_date);
    if (!days) throw new Error("Choose valid leave dates, with the end on or after the start.");
    if (days > 366) throw new Error("A leave request cannot exceed 366 days.");
    if (!input.reason.trim() || input.reason.length > 2000) throw new Error("Provide a reason of 1–2,000 characters.");
    const { data, error } = await supabase.from("leave_applications").insert({
      user_id: userId, ...input, reason: input.reason.trim(), days, status: "pending",
    }).select().single();
    if (error) throw error;
    return data;
  },

  async review(record: LeaveRecord, status: "approved" | "rejected", reason = ""): Promise<LeaveRecord> {
    if (record.status !== "pending") throw new Error("Only pending leave can be reviewed.");
    if (status === "rejected" && !reason.trim()) throw new Error("A rejection reason is required.");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("Please sign in again.");
    if (user.id === record.user_id) throw new Error("You cannot approve or reject your own leave.");
    const { data, error } = await supabase.from("leave_applications").update({
      status, approved_by: status === "approved" ? user.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      rejection_reason: status === "rejected" ? reason.trim() : null,
    }).eq("id", record.id).eq("updated_at", record.updated_at).eq("status", "pending").select().single();
    if (error) {
      if (error.code === "PGRST116") throw new Error("This request changed or was already reviewed. Refresh the list.");
      throw error;
    }
    return data;
  },
};
