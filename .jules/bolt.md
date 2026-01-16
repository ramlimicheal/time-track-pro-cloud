## 2025-05-23 - Supabase Environment Dependency in Local Testing
**Learning:** `src/lib/supabase.ts` throws immediately if env vars are missing, and `AuthProvider` depends on it. This makes testing individual components difficult if they are wrapped in `App.tsx`.
**Action:** When verifying components, create a standalone verification page/route and temporarily mock `src/lib/supabase.ts` to export a dummy client, rather than trying to provide dummy env vars alone (which satisfies the check but fails in `AuthProvider`).
