## 2025-01-21 - Supabase Environment Variables
**Learning:** `src/lib/supabase.ts` throws an explicit error if Supabase env vars are missing, crashing the app immediately. This contradicts the memory which stated it used placeholders.
**Action:** When running frontend verification or local dev server, always provide dummy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if real ones aren't available, to prevent app crash.
