import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { WorkSessionRow } from "@/types/database";

const state = vi.hoisted(() => ({ rows: [] as WorkSessionRow[], transition: vi.fn(), start: vi.fn(), error: null as Error | null }));
vi.mock("@/services/workSessionService", () => ({ workSessionService: {
  list: async () => { if (state.error) throw state.error; return state.rows; }, transition: state.transition, start: state.start,
} }));
import { WorkTimer } from "@/components/dashboard/WorkTimer";

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><WorkTimer employeeId="employee" employeeName="Employee" /></QueryClientProvider>);
}
beforeEach(() => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.rows = [{ id: "session", user_id: "employee", work_date: yesterday, started_at: `${yesterday}T09:00:00Z`,
    last_started_at: null, elapsed_seconds: 3600, finished_at: null, status: "paused", updated_at: `${yesterday}T10:00:00Z` }];
  state.error = null;
  state.start.mockReset().mockResolvedValue({ ...state.rows[0], status: "active" });
  state.transition.mockReset().mockImplementation(async (_record, action: string) => {
    const result = { ...state.rows[0], status: action === "complete" ? "completed" : "active" };
    state.rows = [result as WorkSessionRow];
    return result;
  });
});

describe("timer refresh and cloud controls", () => {
  it("restores paused sessions without enabling a duplicate start", async () => {
    mount();
    expect(await screen.findByRole("button", { name: "Resume" })).toBeEnabled();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
    expect(screen.getByText("0.0h")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start Work" })).not.toBeInTheDocument();
  });
  it("sends the persisted session version when completing a paused session", async () => {
    const expected = state.rows[0];
    mount();
    await userEvent.setup().click(await screen.findByRole("button", { name: "End Work" }));
    await waitFor(() => expect(state.transition).toHaveBeenCalledWith(expected, "complete"));
    expect(await screen.findByRole("button", { name: "Start Work" })).toBeInTheDocument();
  });
  it("shows fetch failures and disables new starts", async () => {
    state.rows = [];
    state.error = new Error("Timer migration required");
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Timer migration required");
    expect(screen.getByRole("button", { name: "Start Work" })).toBeDisabled();
  });
  it("retry clears a failed start so the employee can try again", async () => {
    state.rows = [];
    state.start.mockRejectedValueOnce(new Error("Network unavailable"));
    mount();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Start Work" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Network unavailable");
    expect(screen.getByRole("button", { name: "Start Work" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Start Work" })).toBeEnabled());
  });
});
