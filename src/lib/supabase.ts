// Re-export the auto-generated Lovable Cloud client so all existing
// `@/lib/supabase` imports keep working without touching the generated file.
import type { Database } from '@/types/supabase';
export { supabase } from '@/integrations/supabase/client';
export type { Database };
