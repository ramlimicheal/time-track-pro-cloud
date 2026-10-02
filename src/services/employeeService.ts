import { supabase } from "@/lib/supabase";
import type { ProfileInput, ProfileRow } from "@/types/cloud";
import { fetchAll } from "./pagination";

export const employeeService = {
  roles() {
    return fetchAll((from, to) => supabase.from("user_roles").select("*").order("id").range(from, to));
  },

  async setRole(userId: string, role: "employee" | "manager" | "admin"): Promise<void> {
    const { error } = await supabase.rpc("set_user_role", { _user_id: userId, _role: role });
    if (error) throw error;
  },

  list(): Promise<ProfileRow[]> {
    return fetchAll((from, to) => supabase.from("profiles").select("*")
      .order("full_name").order("id").range(from, to));
  },

  async update(id: string, input: ProfileInput, editEmployment = false): Promise<ProfileRow> {
    if (!input.full_name.trim() || input.full_name.trim().length > 120) {
      throw new Error("Full name must be 1–120 characters.");
    }
    const values = {
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || null,
      ...(editEmployment ? {
        department: input.department?.trim() || null,
        position: input.position?.trim() || null,
      } : {}),
    };
    const { data, error } = await supabase.from("profiles").update(values).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
};
