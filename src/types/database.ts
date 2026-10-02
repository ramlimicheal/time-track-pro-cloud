import type { Database as GeneratedDatabase } from "@/integrations/supabase/types";

export type WorkSessionRow = {
  id: string;
  user_id: string;
  work_date: string;
  started_at: string;
  last_started_at: string | null;
  finished_at: string | null;
  elapsed_seconds: number;
  status: "active" | "paused" | "completed";
  updated_at: string;
}

// Add the forward migration's types without overwriting Lovable-generated files.
export type Database = GeneratedDatabase & {
  public: {
    Tables: {
      work_sessions: {
        Row: WorkSessionRow;
        Insert: Pick<WorkSessionRow, "user_id" | "work_date"> & Partial<WorkSessionRow>;
        Update: Partial<WorkSessionRow>;
        Relationships: [];
      };
    };
    Functions: {
      start_work_session: { Args: { _work_date: string }; Returns: WorkSessionRow[] };
      transition_work_session: {
        Args: { _id: string; _action: "pause" | "resume" | "complete"; _expected_updated_at: string };
        Returns: WorkSessionRow[];
      };
      set_user_role: { Args: { _user_id: string; _role: "employee" | "manager" | "admin" }; Returns: undefined };
    };
  };
};
