import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, Link, RouterProvider } from "react-router-dom";
import type { TimeRecord } from "@/types/cloud";

const state = vi.hoisted(() => ({ rows: [] as TimeRecord[], submit: vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({
  user: { id: "employee" }, profile: { id: "employee", role: "employee", full_name: "<img src=x onerror=alert(1)>" },
}) }));
vi.mock("@/components/layout/MainLayout", () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/services/timesheetService", () => ({
  timesheetService: { list: async () => state.rows, submit: state.submit },
}));

import TimesheetPage from "@/pages/TimesheetPage";
import HistoryPage from "@/pages/HistoryPage";
import { TimeEntryForm } from "@/components/cloud/TimeEntryForm";

function row(patch: Partial<TimeRecord> = {}): TimeRecord {
  return { id: "old-entry", user_id: "employee", work_date: "2026-10-01", start_time: "09:00:00", end_time: "17:00:00",
    break_minutes: 30, ot_start: null, ot_end: null, total_hours: 7.5, description: "Site Alpha", status: "pending",
    approved_at: null, approved_by: null, rejection_reason: null,
    created_at: "2026-10-01T17:00:00Z", updated_at: "2026-10-01T17:00:00Z", ...patch };
}
function mountPage(initial = "/timesheet") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter([
    { path: "/timesheet", element: <><Link to="/history">Navigate to history</Link><TimesheetPage /></> },
    { path: "/history", element: <HistoryPage /> },
  ], { initialEntries: [initial] });
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>);
  return router;
}
beforeEach(() => {
  state.rows = [row()];
  state.submit.mockReset().mockResolvedValue(row());
  localStorage.clear();
});

describe("safe timesheet workflows", () => {
  it("starting a new timesheet never deletes cloud or legacy history", async () => {
    localStorage.setItem("timesheet-old", '{"hours":8}');
    const router = mountPage("/timesheet?entry=old-entry");
    const user = userEvent.setup();
    await screen.findByText("Timesheet entry");
    await user.click(screen.getByRole("button", { name: "New Timesheet" }));
    expect(await screen.findByText("New daily entry")).toBeInTheDocument();
    expect(router.state.location.search).toBe("");
    expect(localStorage.getItem("timesheet-old")).toBe('{"hours":8}');
    expect(state.rows).toHaveLength(1);
    expect(state.submit).not.toHaveBeenCalled();
  });
  it("does not silently reset a dirty new form", async () => {
    mountPage();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Work description"), "New work");
    await user.click(screen.getByRole("button", { name: "New Timesheet" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Discard this unsaved entry?");
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByLabelText("Work description")).toHaveValue("New work");
    await user.click(screen.getByRole("button", { name: "New Timesheet" }));
    await user.click(screen.getByRole("button", { name: "Discard and start new" }));
    expect(screen.getByLabelText("Work description")).toHaveValue("");
  });
  it("discards a rejected entry without asking twice or leaving its URL selected", async () => {
    state.rows = [row({ status: "rejected", rejection_reason: "Clarify work" })];
    const router = mountPage("/timesheet?entry=old-entry");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Work description"), " revision");
    await user.click(screen.getByRole("button", { name: "New Timesheet" }));
    await user.click(await screen.findByRole("button", { name: "Discard and start new" }));
    await waitFor(() => expect(router.state.location.search).toBe(""));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Work description")).toHaveValue("");
  });
  it("blocks dirty navigation and keeps the current entry when cancelled", async () => {
    const router = mountPage();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Work description"), "Unsaved work");
    await user.click(screen.getByRole("link", { name: "Navigate to history" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Discard unsaved changes?");
    expect(router.state.location.pathname).toBe("/timesheet");
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByLabelText("Work description")).toHaveValue("Unsaved work");
  });
  it("allows confirmed navigation and warns on browser unload", async () => {
    const router = mountPage();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Work description"), "Unsaved work");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    await user.click(screen.getByRole("link", { name: "Navigate to history" }));
    await user.click(await screen.findByRole("button", { name: "Discard changes" }));
    await screen.findByText("Timesheet History");
    expect(router.state.location.pathname).toBe("/history");
  });
  it("locks pending and approved records in the form", async () => {
    mountPage("/timesheet?entry=old-entry");
    expect(await screen.findByLabelText("Work description")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Resubmit for approval" })).not.toBeInTheDocument();
  });
  it("saves once, waits for the cloud, and keeps dirty state on failure", async () => {
    const dirty = vi.fn();
    let reject!: (error: Error) => void;
    state.submit.mockImplementation(() => new Promise((_resolve, fail) => { reject = fail; }));
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><TimeEntryForm onDirtyChange={dirty} /></QueryClientProvider>);
    const user = userEvent.setup();
    fireEvent.change(screen.getByLabelText("Work start"), { target: { value: "09:00" } });
    fireEvent.change(screen.getByLabelText("Work end"), { target: { value: "17:00" } });
    await user.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.getByRole("button", { name: "Submitting..." })).toBeDisabled();
    expect(state.submit).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error("Cloud unavailable")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Cloud unavailable");
    expect(dirty).toHaveBeenLastCalledWith(true);
    expect(screen.getByLabelText("Work start")).toHaveValue("09:00");
  });
  it("clears dirty state only after a successful submission", async () => {
    const dirty = vi.fn(), saved = vi.fn();
    const client = new QueryClient();
    render(<QueryClientProvider client={client}><TimeEntryForm onDirtyChange={dirty} onSaved={saved} /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText("Work start"), { target: { value: "09:00" } });
    fireEvent.change(screen.getByLabelText("Work end"), { target: { value: "17:00" } });
    await userEvent.setup().click(screen.getByRole("button", { name: "Submit for approval" }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(dirty).toHaveBeenLastCalledWith(false);
  });
});

describe("filtered and escaped history reports", () => {
  it("applies status and date filters to report totals and printable rows", async () => {
    state.rows = [row(), row({ id: "approved", work_date: "2026-10-02", status: "approved", description: "Approved Alpha", total_hours: 8 }),
      row({ id: "older", work_date: "2026-09-30", status: "approved", description: "Old work", total_hours: 6 })];
    mountPage("/history");
    await screen.findByText("3 entries · 21.50 hours");
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "approved" } });
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-10-01" } });
    expect(screen.getByText("1 entries · 8.00 hours")).toBeInTheDocument();
    expect(screen.queryByText("Old work")).not.toBeInTheDocument();
    expect(screen.getAllByText("Approved Alpha")).toHaveLength(2);
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    await userEvent.setup().click(screen.getByRole("button", { name: "Print filtered report" }));
    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });
  it("renders profile names and descriptions as text, never executable HTML", async () => {
    state.rows = [row({ description: "<script>window.compromised=true</script>" })];
    mountPage("/history");
    await screen.findByText("1 entries · 7.50 hours");
    expect(screen.getAllByText("<script>window.compromised=true</script>")).toHaveLength(2);
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });
  it("prints every filtered record even when the screen is paginated", async () => {
    state.rows = Array.from({ length: 35 }, (_, index) => row({ id: String(index), description: `Record ${index}`, total_hours: 1 }));
    mountPage("/history");
    await screen.findByText("35 entries · 35.00 hours");
    const tables = screen.getAllByRole("table");
    expect(within(tables[0]).getAllByRole("row")).toHaveLength(31);
    expect(within(tables[1]).getAllByRole("row")).toHaveLength(36);
  });
});
