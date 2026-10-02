// @vitest-environment node
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ADMIN = "00000000-0000-4000-8000-000000000001";
const MANAGER = "00000000-0000-4000-8000-000000000002";
const EMPLOYEE = "00000000-0000-4000-8000-000000000003";
const OTHER = "00000000-0000-4000-8000-000000000004";
const LEGACY = "00000000-0000-4000-8000-000000000099";
let db: PGlite;

async function asUser<T>(id: string, sql: string, params: unknown[] = []) {
  return db.transaction(async tx => {
    await tx.exec("SET LOCAL ROLE authenticated");
    await tx.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [id]);
    return tx.query<T>(sql, params);
  });
}

async function timeRow(id: string, date: string) {
  return asUser<{ id: string; updated_at: string }>(id,
    `INSERT INTO public.timesheets(user_id, work_date, start_time, end_time, break_minutes, status, total_hours)
     VALUES ($1, $2, '09:00', '17:00', 30, 'pending', 999) RETURNING id, updated_at`, [id, date]);
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text NOT NULL,
      raw_user_meta_data jsonb NOT NULL DEFAULT '{}', invited_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO authenticated, anon, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon, service_role;
  `);
  const directory = path.resolve("supabase/migrations");
  for (const file of readdirSync(directory).filter(name => name.endsWith(".sql")).sort()) {
    if (file.includes("harden_cloud_workflows")) {
      await db.query("INSERT INTO auth.users(id,email,invited_at,raw_user_meta_data) VALUES ($1,'legacy@example.invalid',NULL,'{\"full_name\":\"Existing account\"}')", [LEGACY]);
      await db.query("UPDATE public.user_roles SET role='employee' WHERE user_id=$1", [LEGACY]);
      await db.query(`INSERT INTO public.timesheets(user_id,work_date,start_time,end_time,total_hours,status,description)
        VALUES ($1,'2026-01-01','09:00','17:00',7,'approved','Existing history')`, [LEGACY]);
    }
    await db.exec(readFileSync(path.join(directory, file), "utf8"));
  }
  for (const [id, name, role] of [[ADMIN, "Admin", "admin"], [MANAGER, "Manager", "manager"],
    [EMPLOYEE, "Employee", "employee"], [OTHER, "Other", "employee"]]) {
    await db.query("INSERT INTO auth.users(id,email,raw_user_meta_data,invited_at) VALUES ($1,$2,$3,now())",
      [id, `${name.toLowerCase()}@example.invalid`, JSON.stringify({ full_name: name })]);
    await db.query("UPDATE public.user_roles SET role=$2::public.app_role WHERE user_id=$1", [id, role]);
  }
  await db.query("INSERT INTO public.leave_balances(user_id,year,annual,sick,casual) VALUES ($1,2026,10,5,3),($1,2027,10,5,3)", [EMPLOYEE]);
});

afterAll(async () => { await db?.close(); });

describe("migration replay and account security", () => {
  it("replays the canonical migration chain on a fresh PostgreSQL database", async () => {
    expect((await db.query("SELECT count(*) AS count FROM public.profiles")).rows[0]).toEqual({ count: 5 });
  });
  it("preserves existing non-invited accounts and approved records without rewriting totals", async () => {
    expect((await asUser(LEGACY, "SELECT description,total_hours,status FROM public.timesheets WHERE user_id=$1", [LEGACY])).rows)
      .toEqual([{ description: "Existing history", total_hours: "7.00", status: "approved" }]);
  });
  it("blocks public signup even with admin metadata", async () => {
    await expect(db.query("INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES (gen_random_uuid(),'public@example.invalid','{\"role\":\"admin\"}')"))
      .rejects.toThrow(/invite-only/);
  });
  it("invited accounts are employees, never first-signup admins", async () => {
    const id = "00000000-0000-4000-8000-000000000005";
    await db.query("INSERT INTO auth.users(id,email,invited_at,raw_user_meta_data) VALUES ($1,'invited@example.invalid',now(),'{\"role\":\"admin\"}')", [id]);
    expect((await db.query("SELECT role FROM public.user_roles WHERE user_id=$1", [id])).rows).toEqual([{ role: "employee" }]);
  });
  it("employees cannot grant themselves an admin role", async () => {
    await expect(asUser(EMPLOYEE, "UPDATE public.user_roles SET role='admin' WHERE user_id=$1", [EMPLOYEE])).rejects.toThrow(/permission denied/);
    await expect(asUser(EMPLOYEE, "SELECT public.set_user_role($1,'admin')", [OTHER])).rejects.toThrow(/Administrator access required/);
  });
  it("administrators cannot change their own role", async () => {
    await expect(asUser(ADMIN, "SELECT public.set_user_role($1,'employee')", [ADMIN])).rejects.toThrow(/own role/);
  });
  it("administrators can assign another account and produce an audit event", async () => {
    await asUser(ADMIN, "SELECT public.set_user_role($1,'manager')", [OTHER]);
    expect((await db.query("SELECT role FROM public.user_roles WHERE user_id=$1", [OTHER])).rows).toEqual([{ role: "manager" }]);
    await asUser(ADMIN, "SELECT public.set_user_role($1,'employee')", [OTHER]);
    expect((await db.query("SELECT count(*)::integer AS count FROM public.audit_logs WHERE action='SET_ROLE'")).rows[0]).toEqual({ count: 2 });
  });
  it("employees cannot change employment status or department", async () => {
    await expect(asUser(EMPLOYEE, "UPDATE public.profiles SET department='Finance' WHERE id=$1", [EMPLOYEE])).rejects.toThrow(/employment details/);
  });
  it("allows employee contact updates", async () => {
    const result = await asUser(EMPLOYEE, "UPDATE public.profiles SET phone='12345' WHERE id=$1 RETURNING phone", [EMPLOYEE]);
    expect(result.rows).toEqual([{ phone: "12345" }]);
  });
  it("protects the last active administrator", async () => {
    await expect(asUser(ADMIN, "UPDATE public.profiles SET status='inactive' WHERE id=$1", [ADMIN])).rejects.toThrow(/last active administrator/);
  });
  it("clients cannot forge audit entries", async () => {
    await expect(asUser(EMPLOYEE, "INSERT INTO public.audit_logs(user_id,action) VALUES ($1,'APPROVED')", [EMPLOYEE])).rejects.toThrow(/permission denied/);
  });
  it("administrators cannot hard-delete profiles", async () => {
    await expect(asUser(ADMIN, "DELETE FROM public.profiles WHERE id=$1", [EMPLOYEE])).rejects.toThrow(/permission denied/);
  });
  it("inactive accounts cannot read or submit business records", async () => {
    await db.query("UPDATE public.profiles SET status='inactive' WHERE id=$1", [OTHER]);
    expect((await asUser(OTHER, "SELECT id FROM public.timesheets")).rows).toHaveLength(0);
    await expect(timeRow(OTHER, "2026-10-08")).rejects.toThrow(/row-level security/);
    await expect(asUser(OTHER, "SELECT * FROM public.start_work_session(current_date)")).rejects.toThrow(/Active account required/);
    await db.query("UPDATE public.profiles SET status='active' WHERE id=$1", [OTHER]);
  });
});

describe("server-enforced timesheet integrity", () => {
  it("computes totals rather than trusting client hours", async () => {
    const inserted = await timeRow(EMPLOYEE, "2026-10-01");
    expect((await asUser(EMPLOYEE, "SELECT total_hours FROM public.timesheets WHERE id=$1", [inserted.rows[0].id])).rows).toEqual([{ total_hours: "7.50" }]);
  });
  it("isolates employees' records", async () => {
    expect((await asUser(OTHER, "SELECT id FROM public.timesheets WHERE user_id=$1", [EMPLOYEE])).rows).toHaveLength(0);
  });
  it("rejects self-approved inserts", async () => {
    await expect(asUser(EMPLOYEE, `INSERT INTO public.timesheets(user_id,work_date,start_time,end_time,status)
      VALUES ($1,'2026-10-02','09:00','17:00','approved')`, [EMPLOYEE])).rejects.toThrow(/Self-approval|row-level security/);
  });
  it("locks pending entries against employee edits", async () => {
    expect((await asUser(EMPLOYEE, "UPDATE public.timesheets SET description='changed' WHERE work_date='2026-10-01' RETURNING id")).rows).toHaveLength(0);
  });
  it("reviewers cannot modify submitted work content", async () => {
    await expect(asUser(MANAGER, "UPDATE public.timesheets SET status='approved',end_time='18:00' WHERE work_date='2026-10-01'"))
      .rejects.toThrow(/Review cannot change/);
  });
  it("records the actual reviewer and locks approved entries", async () => {
    await asUser(MANAGER, "UPDATE public.timesheets SET status='approved',approved_by=$1 WHERE work_date='2026-10-01'", [ADMIN]);
    expect((await db.query("SELECT approved_by FROM public.timesheets WHERE work_date='2026-10-01'")).rows).toEqual([{ approved_by: MANAGER }]);
    expect((await asUser(MANAGER, "UPDATE public.timesheets SET description='changed' WHERE work_date='2026-10-01' RETURNING id")).rows).toHaveLength(0);
  });
  it("a stale version cannot overwrite a manager's decision", async () => {
    const inserted = await timeRow(EMPLOYEE, "2026-10-06");
    const selected = await db.query<{ version: string }>("SELECT updated_at::text AS version FROM public.timesheets WHERE id=$1", [inserted.rows[0].id]);
    await asUser(MANAGER, "UPDATE public.timesheets SET status='approved' WHERE id=$1", [inserted.rows[0].id]);
    const stale = await asUser(ADMIN, "UPDATE public.timesheets SET status='rejected',rejection_reason='Stale' WHERE id=$1 AND updated_at=$2 AND status='pending' RETURNING id",
      [inserted.rows[0].id, selected.rows[0].version]);
    expect(stale.rows).toHaveLength(0);
  });
  it("requires a reason when rejecting", async () => {
    await timeRow(EMPLOYEE, "2026-10-03");
    await expect(asUser(MANAGER, "UPDATE public.timesheets SET status='rejected' WHERE work_date='2026-10-03'")).rejects.toThrow(/rejection reason/);
  });
  it("lets employees resubmit rejected entries", async () => {
    await asUser(MANAGER, "UPDATE public.timesheets SET status='rejected',rejection_reason='Explain work' WHERE work_date='2026-10-03'");
    const result = await asUser(EMPLOYEE, "UPDATE public.timesheets SET status='pending',description='Corrected' WHERE work_date='2026-10-03' RETURNING status,rejection_reason");
    expect(result.rows).toEqual([{ status: "pending", rejection_reason: null }]);
  });
  it("supports overnight shifts and rejects overlapping OT", async () => {
    const result = await asUser(EMPLOYEE, `INSERT INTO public.timesheets(user_id,work_date,start_time,end_time,break_minutes,ot_start,ot_end,status)
      VALUES ($1,'2026-10-04','22:00','06:00',30,'06:00','08:00','pending') RETURNING total_hours`, [EMPLOYEE]);
    expect(result.rows).toEqual([{ total_hours: "9.50" }]);
    await expect(asUser(EMPLOYEE, `INSERT INTO public.timesheets(user_id,work_date,start_time,end_time,ot_start,ot_end,status)
      VALUES ($1,'2026-10-05','09:00','17:00','09:00','17:00','pending')`, [EMPLOYEE])).rejects.toThrow(/overlaps/);
  });
  it("forbids deleting saved history", async () => {
    await expect(asUser(EMPLOYEE, "DELETE FROM public.timesheets WHERE user_id=$1", [EMPLOYEE])).rejects.toThrow(/permission denied/);
  });
});

describe("leave approval controls", () => {
  it("only administrators can configure bounded entitlements", async () => {
    expect((await asUser(EMPLOYEE, "UPDATE public.leave_balances SET annual=999 WHERE user_id=$1 RETURNING id", [EMPLOYEE])).rows).toHaveLength(0);
    expect((await asUser(MANAGER, "UPDATE public.leave_balances SET annual=999 WHERE user_id=$1 RETURNING id", [EMPLOYEE])).rows).toHaveLength(0);
    await expect(asUser(ADMIN, "UPDATE public.leave_balances SET annual=-1 WHERE user_id=$1", [EMPLOYEE])).rejects.toThrow(/cloud_leave_entitlement_limits/);
    await asUser(ADMIN, "UPDATE public.leave_balances SET casual=4 WHERE user_id=$1 AND year=2026", [EMPLOYEE]);
  });
  it("does not let employees insert approved leave", async () => {
    await expect(asUser(EMPLOYEE, `INSERT INTO public.leave_applications(user_id,leave_type,start_date,end_date,days,reason,status)
      VALUES ($1,'annual','2026-12-30','2027-01-02',4,'Holiday','approved')`, [EMPLOYEE])).rejects.toThrow(/must be pending/);
  });
  it("calculates days and rejects duplicate/overlapping applications", async () => {
    await asUser(EMPLOYEE, `INSERT INTO public.leave_applications(user_id,leave_type,start_date,end_date,days,reason)
      VALUES ($1,'annual','2026-12-30','2027-01-02',999,'Holiday')`, [EMPLOYEE]);
    expect((await db.query("SELECT days FROM public.leave_applications WHERE user_id=$1", [EMPLOYEE])).rows).toEqual([{ days: "4.0" }]);
    await expect(asUser(EMPLOYEE, `INSERT INTO public.leave_applications(user_id,leave_type,start_date,end_date,days,reason)
      VALUES ($1,'sick','2026-12-31','2026-12-31',1,'Sick')`, [EMPLOYEE])).rejects.toThrow(/overlaps/);
  });
  it("employees cannot self-approve pending leave", async () => {
    expect((await asUser(EMPLOYEE, "UPDATE public.leave_applications SET status='approved' WHERE user_id=$1 RETURNING id", [EMPLOYEE])).rows).toHaveLength(0);
  });
  it("a manager can approve paid leave across years without changing entitlement totals", async () => {
    await asUser(MANAGER, "UPDATE public.leave_applications SET status='approved' WHERE user_id=$1", [EMPLOYEE]);
    expect((await db.query("SELECT status,approved_by FROM public.leave_applications WHERE user_id=$1", [EMPLOYEE])).rows).toEqual([{ status: "approved", approved_by: MANAGER }]);
    expect((await db.query("SELECT annual FROM public.leave_balances WHERE user_id=$1 ORDER BY year", [EMPLOYEE])).rows).toEqual([{ annual: "10.0" }, { annual: "10.0" }]);
  });
  it("rejects approvals exceeding entitlement", async () => {
    await asUser(EMPLOYEE, `INSERT INTO public.leave_applications(user_id,leave_type,start_date,end_date,days,reason)
      VALUES ($1,'annual','2026-11-01','2026-11-10',10,'Long leave')`, [EMPLOYEE]);
    await expect(asUser(MANAGER, "UPDATE public.leave_applications SET status='approved' WHERE start_date='2026-11-01'")).rejects.toThrow(/Insufficient/);
  });
});

describe("cloud work sessions", () => {
  let id: string;
  let version: string;
  it("starts a server-timestamped session", async () => {
    const result = await asUser<{ id: string; updated_at: string; status: string }>(EMPLOYEE,
      "SELECT * FROM public.start_work_session(current_date)");
    ({ id, updated_at: version } = result.rows[0]);
    expect(result.rows[0].status).toBe("active");
  });
  it("rejects a second concurrent or paused session", async () => {
    await expect(asUser(EMPLOYEE, "SELECT * FROM public.start_work_session(current_date)")).rejects.toThrow(/already active or paused/);
  });
  it("does not allow client-fabricated timer counters", async () => {
    await expect(asUser(EMPLOYEE, "UPDATE public.work_sessions SET elapsed_seconds=99999 WHERE id=$1", [id])).rejects.toThrow(/permission denied/);
  });
  it("another employee cannot transition a session", async () => {
    await expect(asUser(OTHER, "SELECT * FROM public.transition_work_session($1,'pause',$2)", [id, version])).rejects.toThrow(/not found/);
  });
  it("persists a paused session and rejects stale transitions", async () => {
    const result = await asUser<{ updated_at: string; status: string }>(EMPLOYEE,
      "SELECT * FROM public.transition_work_session($1,'pause',$2)", [id, version]);
    const oldVersion = version;
    version = result.rows[0].updated_at;
    expect(result.rows[0].status).toBe("paused");
    expect((await asUser(EMPLOYEE, "SELECT status FROM public.work_sessions WHERE id=$1", [id])).rows).toEqual([{ status: "paused" }]);
    await expect(asUser(EMPLOYEE, "SELECT * FROM public.transition_work_session($1,'resume',$2)", [id, oldVersion])).rejects.toThrow(/Session changed/);
  });
  it("completes a paused session once and retains history", async () => {
    const result = await asUser<{ updated_at: string; status: string }>(EMPLOYEE,
      "SELECT * FROM public.transition_work_session($1,'complete',$2)", [id, version]);
    version = result.rows[0].updated_at;
    expect(result.rows[0].status).toBe("completed");
    await expect(asUser(EMPLOYEE, "SELECT * FROM public.transition_work_session($1,'complete',$2)", [id, version])).rejects.toThrow(/Invalid/);
  });
});
