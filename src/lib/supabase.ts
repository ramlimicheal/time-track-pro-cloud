// Re-export the auto-generated Lovable Cloud client so all existing
// `@/lib/supabase` imports keep working without touching the generated file.
import type { Database } from '@/types/supabase';
import { supabase as generatedSupabase } from '@/integrations/supabase/client';

// The auto-generated Lovable Cloud client is typed against an empty
// Database schema (no tables have been synced yet). Existing services in
// this project were written against a custom Database shape. Until the
// schema is created via migrations and re-introspected, expose the client
// with a permissive type so services keep compiling.
export const supabase = generatedSupabase as any;
export type { Database };
