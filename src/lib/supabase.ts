import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as generatedClient } from "@/integrations/supabase/client";
import type { Database } from "@/types/database";

// Keep one client/session and use the schema extended by the forward migration.
export const supabase = generatedClient as SupabaseClient<Database>;
export type { Database };
