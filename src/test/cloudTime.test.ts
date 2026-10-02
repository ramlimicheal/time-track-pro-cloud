import { describe, expect, it } from "vitest";
import { emptyTimeInput, leaveDays, leaveDaysInYear, localDate, totalTimeHours, validDate, validateTimeInput } from "@/utils/cloudTime";
import { configurationError } from "@/lib/configuration";
import { sessionSeconds, todaySessionHours } from "@/utils/workSessions";
import type { WorkSessionRow } from "@/types/database";

const input = { ...emptyTimeInput("2026-10-01"), start_time: "09:00", end_time: "17:00", break_minutes: 30 };

describe("daily time calculations", () => {
  it("deducts breaks without rounding intermediate intervals", () => expect(totalTimeHours(input)).toBe(7.5));
  it("supports overnight work", () => expect(totalTimeHours({ ...input, start_time: "22:00", end_time: "06:00" })).toBe(7.5));
  it("counts overnight overtime following work", () => expect(totalTimeHours({ ...input, start_time: "22:00", end_time: "06:00", ot_start: "06:00", ot_end: "08:00" })).toBe(9.5));
  it("supports work and OT crossing midnight", () => expect(totalTimeHours({ ...input, start_time: "16:00", end_time: "23:00", ot_start: "23:00", ot_end: "01:00" })).toBe(8.5));
  it.each([
    { start_time: "" }, { end_time: "" }, { start_time: "25:00" },
    { end_time: "09:00" }, { break_minutes: 480 }, { break_minutes: -1 },
    { break_minutes: 0.5 }, { ot_start: "17:00" }, { ot_start: "10:00", ot_end: "12:00" },
    { ot_start: "17:00", ot_end: "17:00" }, { ot_start: "23:00", ot_end: "10:00" },
    { work_date: "2026-02-30" },
  ])("rejects invalid or overlapping intervals: %j", patch => expect(validateTimeInput({ ...input, ...patch })).not.toHaveLength(0));
  it("keeps date-only values independent of UTC conversion", () => {
    expect(localDate(new Date(2026, 9, 1, 0, 15))).toBe("2026-10-01");
    expect(validDate("2024-02-29")).toBe(true);
    expect(validDate("2025-02-29")).toBe(false);
  });
});

describe("leave dates", () => {
  it("counts inclusive calendar days", () => expect(leaveDays("2026-12-30", "2027-01-02")).toBe(4));
  it("splits cross-year leave", () => {
    expect(leaveDaysInYear("2026-12-30", "2027-01-02", 2026)).toBe(2);
    expect(leaveDaysInYear("2026-12-30", "2027-01-02", 2027)).toBe(2);
  });
  it("rejects reversed and malformed dates", () => {
    expect(leaveDays("2026-02-30", "2026-03-02")).toBe(0);
    expect(leaveDays("2026-10-02", "2026-10-01")).toBe(0);
  });
});

describe("timer persistence calculations", () => {
  const session: WorkSessionRow = {
    id: "session", user_id: "employee", work_date: "2026-10-01", started_at: "2026-10-01T09:00:00Z",
    last_started_at: "2026-10-01T10:00:00Z", elapsed_seconds: 3600, finished_at: null,
    status: "paused", updated_at: "2026-10-01T10:00:00Z",
  };
  it("paused time does not accumulate during refresh or breaks", () => expect(sessionSeconds(session, Date.parse("2026-10-01T12:00:00Z"))).toBe(3600));
  it("resume adds only the current active interval", () => expect(sessionSeconds({ ...session, status: "active" }, Date.parse("2026-10-01T10:30:00Z"))).toBe(5400));
  it("does not count previous days as today", () => {
    const now = new Date(2026, 9, 2, 12).getTime();
    expect(todaySessionHours([session], now)).toBe(0);
  });
});

describe("safe application configuration", () => {
  it("reports missing configuration without initializing a client", () => expect(configurationError({})).toMatch(/Set VITE_SUPABASE/));
  it("accepts a local publishable fixture", () => expect(configurationError({
    VITE_SUPABASE_URL: "http://localhost:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  })).toBeNull());
  it("rejects server secrets", () => expect(configurationError({
    VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_test",
  })).toMatch(/never a server secret/));
  it("requires HTTPS outside loopback", () => expect(configurationError({
    VITE_SUPABASE_URL: "http://example.invalid", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  })).toMatch(/Use HTTPS/));
  it("rejects legacy service-role JWTs", () => expect(configurationError({
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: `header.${btoa(JSON.stringify({ role: "service_role" }))}.signature`,
  })).toMatch(/never a service-role/));
});
