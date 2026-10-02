import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { escapeHtml } from "@/utils/escapeHtml";
import { generateEmployeeReportPDF, generateTimesheetPDF } from "@/utils/pdfUtils";
import type { Employee, Timesheet } from "@/types";

let markup = "";
beforeEach(() => {
  markup = "";
  vi.spyOn(window, "open").mockReturnValue({
    document: { write: (value: string) => { markup = value; }, close: () => {} }, print: () => {}, onload: null,
  } as unknown as Window);
});
afterEach(() => vi.restoreAllMocks());

describe("legacy report escaping", () => {
  it("encodes all HTML attribute and text delimiters", () => {
    expect(escapeHtml(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&#39;");
    expect(escapeHtml(null)).toBe("");
  });
  it("keeps employee report fields as literal text", () => {
    const employee: Employee = { id: "fixture", name: "<img src=x onerror=alert(1)>", email: "fixture@example.invalid",
      department: "<script>alert(1)</script>", position: "Welder & fitter", joinDate: "2026-10-01", status: "active", pendingTimesheets: 0 };
    expect(generateEmployeeReportPDF([employee], [])).toBe(true);
    const document = new DOMParser().parseFromString(markup, "text/html");
    expect(document.querySelector("img,script")).toBeNull();
    expect(document.body.textContent).toContain(employee.name);
    expect(document.body.textContent).toContain(employee.position);
  });
  it("escapes timesheet content and malicious runtime status values", () => {
    const timesheet = {
      id: "fixture", employeeId: "<svg onload=alert(1)>", employeeName: "<img src=x>",
      month: 10, year: 2026, status: 'pending" onmouseover="alert(1)',
      entries: [{ id: "fixture", date: "2026-10-01", workStart: "<script>alert(1)</script>", workEnd: "17:00",
        breakStart: "", breakEnd: "", otStart: "", otEnd: "", totalHours: 8, description: "<img src=x onerror=alert(1)>",
        remarks: "", status: 'pending" onclick="alert(1)' }],
    } as unknown as Timesheet;
    expect(generateTimesheetPDF(timesheet)).toBe(true);
    const document = new DOMParser().parseFromString(markup, "text/html");
    expect(document.querySelector("img,script,svg,[onclick],[onmouseover]")).toBeNull();
    expect(document.body.textContent).toContain(timesheet.employeeName);
    expect(document.body.textContent).toContain(timesheet.entries[0].description);
  });
});
