import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import type { ProfileRow } from "@/types/cloud";

const state = vi.hoisted(() => ({
  session: null as Session | null,
  listeners: new Set<(event: string, session: Session | null) => void>(),
  profiles: new Map<string, ProfileRow>(),
  roles: new Map<string, string[]>(),
  delayedProfile: null as null | ((id: string) => Promise<{ data: ProfileRow | null; error: null }>),
  passwordUpdates: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: state.session }, error: null })),
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        state.listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => state.listeners.delete(callback) } } };
      },
      signInWithPassword: vi.fn(async () => ({ data: {}, error: null })),
      signOut: vi.fn(async () => {
        state.session = null;
        state.listeners.forEach(listener => listener("SIGNED_OUT", null));
        return { error: null };
      }),
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
      updateUser: state.passwordUpdates,
    },
    from: (table: string) => ({
      select: () => ({
        eq: (_column: string, id: string) => table === "profiles"
          ? { maybeSingle: () => state.delayedProfile?.(id) ?? Promise.resolve({ data: state.profiles.get(id) ?? null, error: null }) }
          : Promise.resolve({ data: (state.roles.get(id) ?? []).map(role => ({ role })), error: null }),
      }),
    }),
  },
}));
vi.mock("@/components/layout/Header", () => ({ Header: () => <header>Cloud navigation</header> }));

import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import ResetPassword from "@/pages/ResetPassword";

function profile(id: string): ProfileRow {
  return { id, full_name: `Employee ${id}`, email: `${id}@example.invalid`, department: "Operations",
    position: "Welder", phone: null, employee_code: null, avatar_url: null, status: "active",
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
}
function session(id: string): Session {
  return { access_token: "local-test-fixture", refresh_token: "local-test-fixture", token_type: "bearer", expires_in: 3600,
    user: { id, email: `${id}@example.invalid`, aud: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" } };
}
function Probe() {
  const auth = useAuth();
  return <MainLayout><h1>Signed in: {auth.profile?.full_name}</h1>
    <button onClick={() => void auth.signOut()}>Sign out fixture</button></MainLayout>;
}
function mount(initial = "/dashboard") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([
    { path: "/", element: <Index /> }, { path: "/dashboard", element: <Probe /> },
    { path: "/reset-password", element: <ResetPassword /> }, { path: "/admin", element: <Probe /> },
  ], { initialEntries: [initial] });
  render(<StrictMode><QueryClientProvider client={client}><AuthProvider><RouterProvider router={router} /></AuthProvider></QueryClientProvider></StrictMode>);
  return { client, router };
}

beforeEach(() => {
  localStorage.clear();
  state.session = session("first");
  state.profiles.clear();
  state.profiles.set("first", profile("first"));
  state.profiles.set("second", profile("second"));
  state.roles.clear();
  state.roles.set("first", ["employee"]);
  state.roles.set("second", ["employee"]);
  state.delayedProfile = null;
  state.passwordUpdates.mockReset().mockResolvedValue({ error: null });
});

describe("unified authentication", () => {
  it("opens a protected layout for fresh Supabase users with no legacy identity", async () => {
    mount();
    expect(await screen.findByText("Signed in: Employee first")).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
  });
  it("preserves legacy records under React StrictMode", async () => {
    localStorage.setItem("employees", '[{"id":"legacy"}]');
    localStorage.setItem("timesheet-old", '{"hours":8}');
    mount();
    await screen.findByText("Signed in: Employee first");
    expect(localStorage.getItem("employees")).toBe('[{"id":"legacy"}]');
    expect(localStorage.getItem("timesheet-old")).toBe('{"hours":8}');
  });
  it("holds the loading state until profile fetch completes", async () => {
    let resolve!: (value: { data: ProfileRow; error: null }) => void;
    state.delayedProfile = () => new Promise(done => { resolve = done; });
    mount();
    await waitFor(() => expect(resolve).toBeDefined());
    expect(screen.queryByText("Signed in: Employee first")).not.toBeInTheDocument();
    await act(async () => resolve({ data: profile("first"), error: null }));
    expect(await screen.findByText("Signed in: Employee first")).toBeInTheDocument();
  });
  it("does not resurrect an old user's profile after sign-out", async () => {
    let resolve!: (value: { data: ProfileRow; error: null }) => void;
    state.delayedProfile = () => new Promise(done => { resolve = done; });
    mount();
    await waitFor(() => expect(resolve).toBeDefined());
    await act(async () => { state.session = null; state.listeners.forEach(listener => listener("SIGNED_OUT", null)); });
    await act(async () => resolve({ data: profile("first"), error: null }));
    expect(await screen.findByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByText("Signed in: Employee first")).not.toBeInTheDocument();
  });
  it("clears query data when accounts change", async () => {
    const { client } = mount();
    await screen.findByText("Signed in: Employee first");
    client.setQueryData(["private-old-user-data"], { confidential: true });
    await act(async () => { state.session = session("second"); state.listeners.forEach(listener => listener("SIGNED_IN", state.session)); });
    await screen.findByText("Signed in: Employee second");
    expect(client.getQueryData(["private-old-user-data"])).toBeUndefined();
  });
  it("does not unmount the active page when a token refreshes", async () => {
    mount();
    await screen.findByText("Signed in: Employee first");
    await act(async () => state.listeners.forEach(listener => listener("TOKEN_REFRESHED", state.session)));
    expect(screen.getByText("Signed in: Employee first")).toBeInTheDocument();
  });
  it("shows a retryable notice rather than a redirect loop for a missing profile", async () => {
    state.profiles.delete("first");
    const { router } = mount();
    expect(await screen.findByText("Account access unavailable")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/dashboard");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
  it("rejects inactive accounts", async () => {
    state.profiles.set("first", { ...profile("first"), status: "inactive" });
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("inactive");
  });
  it("rejects accounts with no assigned role", async () => {
    state.roles.delete("first");
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("no assigned role");
  });
  it("routes recovery sessions to the password form", async () => {
    const { router } = mount();
    await screen.findByText("Signed in: Employee first");
    await act(async () => state.listeners.forEach(listener => listener("PASSWORD_RECOVERY", state.session)));
    expect(await screen.findByText("Set your password")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/reset-password");
  });
});

describe("password recovery route", () => {
  it("shows a useful expired-link message instead of a 404", async () => {
    state.session = null;
    mount("/reset-password");
    expect(await screen.findByText(/link is missing or expired/)).toBeInTheDocument();
  });
  it("updates Supabase credentials and never writes a plaintext password to storage", async () => {
    mount("/reset-password");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("New password"), "local-fixture-password");
    await user.type(screen.getByLabelText("Confirm password"), "local-fixture-password");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() => expect(state.passwordUpdates).toHaveBeenCalledWith({ password: "local-fixture-password" }));
    expect(localStorage.getItem("user")).toBeNull();
    expect(await screen.findByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});
