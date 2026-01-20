import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Helper to check if we're in a real environment
const isProd = import.meta.env.PROD;
const hasEnvVars = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use provided env vars or fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Only throw if missing in production, otherwise warn and use placeholders to allow UI to load
if (!hasEnvVars && isProd) {
  console.error('Missing Supabase environment variables');
} else if (!hasEnvVars) {
  console.warn('Missing Supabase environment variables, falling back to placeholders for development');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type { Database };
