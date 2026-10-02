import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/lib/supabase", () => {
  const query = { eq: () => query, select: () => query, single: async () => ({ data: { id: "employee" }, error: null }) };
  return { supabase: { from: () => ({ update: (values: unknown) => { state.update(values); return query; } }) } };
});
import { employeeService } from "@/services/employeeService";

beforeEach(() => state.update.mockClear());
describe("contact editing does not change employment fields", () => {
  const input = { full_name: "Employee", phone: "123", department: "", position: " Welder " };
  it("does not normalize read-only legacy employment fields during an employee contact edit", async () => {
    await employeeService.update("employee", input);
    expect(state.update).toHaveBeenCalledWith({ full_name: "Employee", phone: "123" });
  });
  it("includes employment fields only when explicitly editing them", async () => {
    await employeeService.update("employee", input, true);
    expect(state.update).toHaveBeenCalledWith({ full_name: "Employee", phone: "123", department: null, position: "Welder" });
  });
});
