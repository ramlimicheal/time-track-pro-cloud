export function configurationError(env: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string }): string | null {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the application environment.";
  }
  try {
    const url = new URL(env.VITE_SUPABASE_URL);
    if (!["https:", "http:"].includes(url.protocol)) return "The Supabase URL must use HTTPS (or HTTP for local testing).";
    if (url.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      return "Use HTTPS for a remote Supabase project. HTTP is only allowed for loopback testing.";
    }
  } catch {
    return "The Supabase URL is invalid.";
  }
  if (env.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith("sb_secret_")) {
    return "Use a Supabase publishable key, never a server secret key, in the frontend.";
  }
  const parts = env.VITE_SUPABASE_PUBLISHABLE_KEY.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string };
      if (payload.role === "service_role") return "Use an anon/publishable key, never a service-role key, in the frontend.";
    } catch {
      return "The Supabase anon key is invalid.";
    }
  }
  return null;
}
