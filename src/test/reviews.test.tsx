import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { LeaveRecord, ProfileRow, TimeRecord } from "@/types/cloud";

const state = vi.hoisted(() => ({
  role: "admin", profiles: [] as ProfileRow[], times: [] as TimeRecord[], leaves: [] as LeaveRecord[],
  reviewTime: vi.fn(), reviewLeave: vi.fn(), setRole: vi.fn(),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "reviewer" }, profile: { id: "reviewer", role: state.role } }) }));
vi.mock("@/components/layout/MainLayout", () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/services/timesheetService", () => ({ timesheetService: { list: async () => state.times, review: state.reviewTime } }));
vi.mock("@/services/leaveService", () => ({ leaveService: { list: async () => state.leaves, review: state.reviewLeave } }));
vi.mock("@/services/employeeService", () => ({ employeeService: {
  list: async () => state.profiles, roles: async () => [{ user_id: "reviewer", role: "admin" }, { user_id: "employee", role: "employee" }],
  setRole: state.setRole,
} }));
import AdminPage from "@/pages/AdminPage";

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><AdminPage /></QueryClientProvider>);
}
beforeEach(() => {
  state.role = "admin";
  state.profiles = ["reviewer", "employee"].map(id => ({
    id, full_name: id, email: `${id}@example.invalid`, department: null, position: null, phone: null, employee_code: null,
    avatar_url: null, status: "active", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  }));
  state.times = [{
    id: "entry", user_id: "employee", work_date: "2026-10-01", start_time: "09:00:00", end_time: "17:00:00",
    break_minutes: 0, ot_start: null, ot_end: null, total_hours: 8, description: "Site work", status: "pending",
    approved_at: null, approved_by: null, rejection_reason: null, created_at: "2026-10-01T17:00:00Z", updated_at: "2026-10-01T17:00:00Z",
  }];
  state.leaves = [{
    id: "leave", user_id: "employee", leave_type: "annual", start_date: "2026-10-02", end_date: "2026-10-02",
    days: 1, reason: "Appointment", status: "pending", approved_at: null, approved_by: null, rejection_reason: null,
    created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z",
  }];
  state.reviewTime.mockReset().mockResolvedValue({});
  state.reviewLeave.mockReset().mockResolvedValue({});
  state.setRole.mockReset().mockResolvedValue(undefined);
});

describe("persisted review confirmation", () => {
  it("does not claim approval before persistence completes, and retains failures for retry", async () => {
    let reject!: (error: Error) => void;
    state.reviewTime.mockImplementation(() => new Promise((_resolve, fail) => { reject = fail; }));
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Timesheets" }));
    await user.click(await screen.findByRole("button", { name: "Approve" }));
    expect(state.reviewTime).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirm decision" }));
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    await act(async () => reject(new Error("Stale entry: refresh")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Stale entry: refresh");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("submits rejection reasons and closes only after success", async () => {
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Leave" }));
    await user.click(await screen.findByRole("button", { name: "Reject" }));
    await user.click(screen.getByRole("button", { name: "Confirm decision" }));
    expect(state.reviewLeave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Rejection reason"), "Dates need correction");
    await user.click(screen.getByRole("button", { name: "Confirm decision" }));
    await waitFor(() => expect(state.reviewLeave).toHaveBeenCalledWith(state.leaves[0], "rejected", "Dates need correction"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("never offers self-review controls", async () => {
    state.times[0].user_id = "reviewer";
    mount();
    await userEvent.setup().click(screen.getByRole("tab", { name: "Timesheets" }));
    expect(await screen.findByText("Another reviewer required")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });
  it("managers cannot see role or entitlement controls", async () => {
    state.role = "manager";
    mount();
    expect(screen.queryByRole("tab", { name: "Account roles" })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("tab", { name: "Employees" }));
    await screen.findByText("employee@example.invalid");
    expect(screen.queryByRole("button", { name: "Leave entitlement" })).not.toBeInTheDocument();
  });
  it("disables an administrator's own role control", async () => {
    mount();
    await userEvent.setup().click(screen.getByRole("tab", { name: "Account roles" }));
    expect(await screen.findByLabelText("Role for reviewer")).toBeDisabled();
    expect(screen.getByLabelText("Role for employee")).toBeEnabled();
  });
});
