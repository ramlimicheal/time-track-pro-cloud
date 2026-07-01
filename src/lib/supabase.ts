// Re-export the auto-generated Lovable Cloud client so all existing
// `@/lib/supabase` imports keep working without touching the generated file.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { supabase as generatedSupabase } from '@/integrations/supabase/client';

// The auto-generated client is typed against an empty Database schema
// (no tables introspected yet). Cast to our custom Database types so that
// existing services keep their strong typing until a schema sync is run.
export const supabase = generatedSupabase as unknown as SupabaseClient<Database>;
export type { Database };
