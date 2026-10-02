import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AppRole } from "@/types/cloud";
import { AuthContext, type Profile } from "@/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

export type { AppRole, Profile } from "@/hooks/useAuth";

async function loadProfile(userId: string): Promise<Profile> {
  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const { data: profileRow, error: profileFailure } = profileResult;
  const { data: roleRows, error: roleFailure } = roleResult;
  if (profileFailure) throw profileFailure;
  if (roleFailure) throw roleFailure;
  if (!profileRow) throw new Error("Your account has not been provisioned. Contact your administrator.");
  if (profileRow.status !== "active") throw new Error("Your account is inactive. Contact your administrator.");
  const roles = (roleRows ?? []).map(row => row.role);
  if (!roles.length) throw new Error("Your account has no assigned role. Contact your administrator.");
  const role: AppRole = roles.includes("admin") ? "admin" : roles.includes("manager") ? "manager" : "employee";
  return { ...profileRow, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const revision = useRef(0);
  const userId = useRef<string | null>(null);
  const profileId = useRef<string | null>(null);
  const mounted = useRef(false);

  async function refreshProfile() {
    const id = userId.current;
    if (!id) return;
    const request = ++revision.current;
    setLoading(true);
    setProfileError(null);
    try {
      const next = await loadProfile(id);
      if (mounted.current && request === revision.current) {
        profileId.current = next.id;
        setProfile(next);
      }
    } catch (error) {
      if (mounted.current && request === revision.current) {
        setProfile(null);
        profileId.current = null;
        setProfileError(errorMessage(error, "Could not load your account."));
      }
    } finally {
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    let disposed = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    function invalidateRequests() { ++revision.current; }

    function applySession(next: Session | null, recovery = false) {
      const request = ++revision.current;
      const id = next?.user.id ?? null;
      if (id !== userId.current) {
        queryClient.clear();
        profileId.current = null;
        setProfile(null);
      }
      userId.current = id;
      setSession(next);
      setUser(next?.user ?? null);
      setProfileError(null);
      if (recovery) setPasswordRecovery(true);
      if (!id) {
        setProfile(null);
        setPasswordRecovery(false);
        setLoading(false);
        return;
      }
      setLoading(profileId.current !== id);
      // Supabase auth listeners run under its auth lock. Fetch after it releases.
      const timer = setTimeout(async () => {
        timers.delete(timer);
        try {
          const nextProfile = await loadProfile(id);
          if (!disposed && request === revision.current) {
            profileId.current = nextProfile.id;
            setProfile(nextProfile);
          }
        } catch (error) {
          if (!disposed && request === revision.current) {
            setProfile(null);
            profileId.current = null;
            setProfileError(errorMessage(error, "Could not load your account."));
          }
        } finally {
          if (!disposed && request === revision.current) setLoading(false);
        }
      }, 0);
      timers.add(timer);
    }

    const initialRevision = revision.current;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (!disposed) applySession(next, event === "PASSWORD_RECOVERY");
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (disposed || revision.current !== initialRevision) return;
      if (error) {
        setProfileError("Could not restore your session. Please sign in again.");
        setLoading(false);
      } else {
        applySession(data.session);
      }
    }).catch(() => {
      if (!disposed && revision.current === initialRevision) {
        setProfileError("Could not restore your session. Please sign in again.");
        setLoading(false);
      }
    });
    return () => {
      disposed = true;
      mounted.current = false;
      invalidateRequests();
      subscription.unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [queryClient]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    ++revision.current;
    userId.current = null;
    profileId.current = null;
    queryClient.clear();
    setUser(null);
    setSession(null);
    setProfile(null);
    setPasswordRecovery(false);
    setLoading(false);
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async function updatePassword(password: string) {
    if (password.length < 12) throw new Error("Use at least 12 characters for your password.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setPasswordRecovery(false);
    toast.success("Password updated successfully");
  }

  async function signInWithOAuth(provider: "google") {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) throw new Error(result.error.message || "Google sign-in failed");
  }

  return <AuthContext.Provider value={{
    user, profile, session, loading, profileError, passwordRecovery,
    signIn, signOut, resetPassword, updatePassword, refreshProfile, signInWithOAuth,
  }}>{children}</AuthContext.Provider>;
}
