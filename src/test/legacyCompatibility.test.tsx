import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { EnhancedHistoryDashboard } from "@/components/history/EnhancedHistoryDashboard";
import { AdvancedUserManagement } from "@/components/admin/AdvancedUserManagement";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import type { Timesheet } from "@/types";

vi.mock("@/components/history/MonthView", () => ({
  MonthView: ({ timesheets }: { timesheets: Timesheet[] }) => <div>{timesheets.map(row => <p key={row.id}>{row.employeeName}</p>)}</div>,
}));
vi.mock("@/components/history/TimesheetAnalytics", () => ({ TimesheetAnalytics: () => <div>Legacy analytics fixture</div> }));

beforeEach(() => localStorage.clear());

describe("typed legacy compatibility", () => {
  it("does not discard all records when status changes without date bounds", async () => {
    const rows: Timesheet[] = [
      { id: "pending", employeeId: "one", employeeName: "Pending worker", month: 10, year: 2026, entries: [], status: "pending" },
      { id: "approved", employeeId: "two", employeeName: "Approved worker", month: 10, year: 2026, entries: [], status: "approved" },
    ];
    render(<EnhancedHistoryDashboard timesheets={rows} onExport={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: "pending" }));
    expect(screen.getByText("Pending worker")).toBeInTheDocument();
    expect(screen.queryByText("Approved worker")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Analytics" }));
    expect(await screen.findByText("Legacy analytics fixture")).toBeInTheDocument();
  });
  it("reads legacy usernames without changing stored records", async () => {
    const stored = JSON.stringify([{ id: "fixture", username: "Existing worker", email: "fixture@example.invalid" }]);
    localStorage.setItem("users", stored);
    render(<AdvancedUserManagement />);
    expect(await screen.findByText("Existing worker")).toBeInTheDocument();
    expect(localStorage.getItem("users")).toBe(stored);
  });
});

describe("extracted UI contexts", () => {
  it("keeps form labels associated with their input", async () => {
    function Fixture() {
      const form = useForm({ defaultValues: { name: "" } });
      return <Form {...form}><FormField control={form.control} name="name" render={({ field }) =>
        <FormItem><FormLabel>Worker name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} /></Form>;
    }
    render(<Fixture />);
    const input = screen.getByRole("textbox", { name: "Worker name" });
    await userEvent.setup().type(input, "Fixture worker");
    expect(input).toHaveValue("Fixture worker");
    expect(input).toHaveAttribute("id", screen.getByText("Worker name").getAttribute("for"));
  });
  it("keeps sidebar hooks connected to their provider", async () => {
    function Probe() {
      const sidebar = useSidebar();
      return <button onClick={sidebar.toggleSidebar}>{sidebar.state}</button>;
    }
    render(<SidebarProvider><Probe /></SidebarProvider>);
    await userEvent.setup().click(screen.getByRole("button", { name: "expanded" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "collapsed" })).toBeInTheDocument());
  });
});
