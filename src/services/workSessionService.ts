import { supabase } from "@/lib/supabase";
import type { WorkSessionRow } from "@/types/database";
import { fetchAll } from "./pagination";

export const workSessionService = {
  list(userId: string): Promise<WorkSessionRow[]> {
    return fetchAll((from, to) => supabase.from("work_sessions").select("*")
      .eq("user_id", userId).order("started_at", { ascending: false }).order("id").range(from, to));
  },
  async start(date: string): Promise<WorkSessionRow> {
    const { data, error } = await supabase.rpc("start_work_session", { _work_date: date });
    if (error) throw error;
    if (!data?.[0]) throw new Error("The session could not be started.");
    return data[0];
  },
  async transition(record: WorkSessionRow, action: "pause" | "resume" | "complete"): Promise<WorkSessionRow> {
    const { data, error } = await supabase.rpc("transition_work_session", {
      _id: record.id, _action: action, _expected_updated_at: record.updated_at,
    });
    if (error) throw error;
    if (!data?.[0]) throw new Error("The session changed. Refresh before trying again.");
    return data[0];
  },
};
