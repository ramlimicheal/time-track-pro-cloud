import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLeaves, useProfiles, useRefreshWorkforce, useTimesheets } from "@/hooks/useCloudData";
import { employeeService } from "@/services/employeeService";
import { timesheetService } from "@/services/timesheetService";
import { leaveService } from "@/services/leaveService";
import type { AppRole, LeaveRecord, ProfileRow, TimeRecord } from "@/types/cloud";
import { MainLayout } from "@/components/layout/MainLayout";
import { QueryState } from "@/components/cloud/QueryState";
import { ReviewDialog } from "@/components/cloud/ReviewDialog";
import { ProfileEditor } from "@/components/cloud/ProfileEditor";
import { EntitlementEditor } from "@/components/cloud/EntitlementEditor";
import { StatusBadge } from "@/components/cloud/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { displayDate, localDate } from "@/utils/cloudTime";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

type Decision = { kind: "time"; record: TimeRecord; approve: boolean } | { kind: "leave"; record: LeaveRecord; approve: boolean };

export default function AdminPage() {
  const { user, profile } = useAuth();
  const profiles = useProfiles();
  const timesheets = useTimesheets(true);
  const leaves = useLeaves(true);
  const refresh = useRefreshWorkforce();
  const [editing, setEditing] = useState<ProfileRow | null>(null);
  const [entitlement, setEntitlement] = useState<ProfileRow | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [roleTarget, setRoleTarget] = useState<{ user: ProfileRow; role: AppRole } | null>(null);
  const isAdmin = profile?.role === "admin";
  const roles = useQuery({
    queryKey: ["roles", user?.id], queryFn: () => employeeService.roles(), enabled: Boolean(user && isAdmin),
  });
  const names = useMemo(() => new Map((profiles.data ?? []).map(row => [row.id, row.full_name || row.email])), [profiles.data]);
  const review = useMutation<TimeRecord | LeaveRecord, unknown, string>({
    mutationFn: (reason: string) => {
      if (!decision) throw new Error("Select a record.");
      const status = decision.approve ? "approved" : "rejected";
      return decision.kind === "time"
        ? timesheetService.review(decision.record, status, reason)
        : leaveService.review(decision.record, status, reason);
    },
    onSuccess: async () => { await refresh(); setDecision(null); toast.success("Decision saved to the cloud."); },
    onError: async () => { await refresh(); },
  });
  const roleChange = useMutation({
    mutationFn: () => {
      if (!roleTarget) throw new Error("Select an account.");
      return employeeService.setRole(roleTarget.user.id, roleTarget.role);
    },
    onSuccess: async () => { await refresh(); setRoleTarget(null); toast.success("Role updated."); },
  });
  function openDecision(next: Decision) { review.reset(); setDecision(next); }
  const statusMatch = (status: string) => filter === "all" || status === filter;
  const month = localDate().slice(0, 7);
  return <MainLayout><div className="space-y-5 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold">{isAdmin ? "Admin Dashboard" : "Manager Dashboard"}</h1>
        <p className="text-gray-600">Cloud workforce records and approval queues.</p></div>
      <Button variant="outline" onClick={() => void refresh()}>Refresh records</Button>
    </div>
    <Tabs defaultValue="dashboard" className="space-y-4">
      <TabsList className="flex h-auto flex-wrap justify-start">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger><TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="timesheets">Timesheets</TabsTrigger><TabsTrigger value="leave">Leave</TabsTrigger>
        {isAdmin && <TabsTrigger value="users">Account roles</TabsTrigger>}
      </TabsList>
      <TabsContent value="dashboard">
        <QueryState loading={profiles.isPending || timesheets.isPending || leaves.isPending}
          error={profiles.error || timesheets.error || leaves.error} retry={() => void refresh()} />
        {!profiles.isPending && !timesheets.isPending && !leaves.isPending && !profiles.error && !timesheets.error && !leaves.error &&
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[
            ["Active accounts", (profiles.data ?? []).filter(row => row.status === "active").length],
            ["Pending time entries", (timesheets.data ?? []).filter(row => row.status === "pending").length],
            ["Pending leave", (leaves.data ?? []).filter(row => row.status === "pending").length],
            ["Approved hours this month", (timesheets.data ?? []).filter(row => row.status === "approved" && row.work_date.startsWith(month))
              .reduce((sum, row) => sum + Number(row.total_hours ?? 0), 0).toFixed(2)],
          ].map(([label, value]) => <Card key={label}><CardContent className="pt-6"><p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p></CardContent></Card>)}</div>}
      </TabsContent>
      <TabsContent value="employees"><Card><CardHeader><CardTitle>Employee accounts</CardTitle></CardHeader><CardContent>
        <p className="mb-4 text-sm text-gray-600">Invite new accounts through your Lovable/Supabase authentication administrator.
          Invitations should return to <code>/reset-password</code>. No passwords are created or stored here.</p>
        <Label htmlFor="employee-search">Search employees</Label><Input id="employee-search" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
        <QueryState loading={profiles.isPending} error={profiles.error} retry={() => void profiles.refetch()} />
        {!profiles.isPending && !profiles.error && <Table><TableHeader><TableRow>
          <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead><TableHead>Position / trade</TableHead><TableHead>Status</TableHead>
          {isAdmin && <TableHead>Action</TableHead>}
        </TableRow></TableHeader><TableBody>{(profiles.data ?? []).filter(row => `${row.full_name} ${row.email} ${row.department ?? ""} ${row.position ?? ""}`.toLowerCase().includes(search.toLowerCase())).map(row =>
          <TableRow key={row.id}><TableCell>{row.full_name}</TableCell><TableCell>{row.email}</TableCell><TableCell>{row.department || "—"}</TableCell>
            <TableCell>{row.position || "—"}</TableCell><TableCell>{row.status}</TableCell>{isAdmin && <TableCell><div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(row)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => setEntitlement(row)}>Leave entitlement</Button>
            </div></TableCell>}</TableRow>)}
        </TableBody></Table>}
      </CardContent></Card></TabsContent>
      <TabsContent value="timesheets"><Card><CardHeader><CardTitle>Timesheet review</CardTitle></CardHeader><CardContent>
        <StatusFilter value={filter} onChange={setFilter} />
        <QueryState loading={timesheets.isPending || profiles.isPending} error={timesheets.error || profiles.error} retry={() => void refresh()} />
        {!timesheets.isPending && !profiles.isPending && !timesheets.error && !profiles.error && <Table><TableHeader><TableRow>
          <TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Work / break / OT</TableHead><TableHead>Hours</TableHead>
          <TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead>Review</TableHead>
        </TableRow></TableHeader><TableBody>{(timesheets.data ?? []).filter(row => statusMatch(row.status)).map(row => <TableRow key={row.id}>
          <TableCell>{names.get(row.user_id) ?? "Unknown account"}</TableCell><TableCell>{displayDate(row.work_date)}</TableCell>
          <TableCell>{row.start_time?.slice(0, 5)}–{row.end_time?.slice(0, 5)}<p className="text-sm">{row.break_minutes}m break</p>
            {row.ot_start && <p className="text-sm">OT {row.ot_start.slice(0, 5)}–{row.ot_end?.slice(0, 5)}</p>}</TableCell>
          <TableCell>{Number(row.total_hours ?? 0).toFixed(2)}</TableCell><TableCell className="max-w-xs break-words">{row.description || "—"}</TableCell>
          <TableCell><StatusBadge status={row.status} /></TableCell><TableCell>
            <ReviewButtons pending={row.status === "pending"} own={row.user_id === user?.id} busy={review.isPending}
              onApprove={() => openDecision({ kind: "time", record: row, approve: true })}
              onReject={() => openDecision({ kind: "time", record: row, approve: false })} />
          </TableCell>
        </TableRow>)}</TableBody></Table>}
      </CardContent></Card></TabsContent>
      <TabsContent value="leave"><Card><CardHeader><CardTitle>Leave review</CardTitle></CardHeader><CardContent>
        <StatusFilter value={filter} onChange={setFilter} />
        <QueryState loading={leaves.isPending || profiles.isPending} error={leaves.error || profiles.error} retry={() => void refresh()} />
        {!leaves.isPending && !profiles.isPending && !leaves.error && !profiles.error && <Table><TableHeader><TableRow>
          <TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Days</TableHead>
          <TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Review</TableHead>
        </TableRow></TableHeader><TableBody>{(leaves.data ?? []).filter(row => statusMatch(row.status)).map(row => <TableRow key={row.id}>
          <TableCell>{names.get(row.user_id) ?? "Unknown account"}</TableCell><TableCell>{row.leave_type}</TableCell>
          <TableCell>{displayDate(row.start_date)} to {displayDate(row.end_date)}</TableCell><TableCell>{row.days}</TableCell>
          <TableCell className="max-w-xs break-words">{row.reason}</TableCell><TableCell><StatusBadge status={row.status} /></TableCell>
          <TableCell><ReviewButtons pending={row.status === "pending"} own={row.user_id === user?.id} busy={review.isPending}
            onApprove={() => openDecision({ kind: "leave", record: row, approve: true })}
            onReject={() => openDecision({ kind: "leave", record: row, approve: false })} /></TableCell>
        </TableRow>)}</TableBody></Table>}
      </CardContent></Card></TabsContent>
      {isAdmin && <TabsContent value="users"><Card><CardHeader><CardTitle>Account roles</CardTitle></CardHeader><CardContent>
        <p className="mb-4 text-sm text-gray-600">Roles are database-controlled. You cannot change your own role or remove the last administrator.</p>
        <QueryState loading={roles.isPending || profiles.isPending} error={roles.error || profiles.error} retry={() => { void roles.refetch(); void profiles.refetch(); }} />
        {!roles.isPending && !profiles.isPending && !roles.error && !profiles.error && <Table><TableHeader><TableRow>
          <TableHead>Account</TableHead><TableHead>Role</TableHead>
        </TableRow></TableHeader><TableBody>{(profiles.data ?? []).map(row => {
          const assigned = (roles.data ?? []).filter(role => role.user_id === row.id).map(role => role.role);
          const current = assigned.includes("admin") ? "admin" : assigned.includes("manager") ? "manager" : assigned.includes("employee") ? "employee" : "";
          return <TableRow key={row.id}><TableCell>{row.full_name || row.email}</TableCell><TableCell>
            <select aria-label={`Role for ${row.full_name || row.email}`} className="h-10 border rounded bg-white px-3"
              value={current} disabled={row.id === user?.id || roleChange.isPending}
              onChange={e => { roleChange.reset(); setRoleTarget({ user: row, role: e.target.value as AppRole }); }}>
              {!current && <option value="">Not assigned</option>}
              {["employee", "manager", "admin"].map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </TableCell></TableRow>;
        })}</TableBody></Table>}
      </CardContent></Card></TabsContent>}
    </Tabs>
    <Dialog open={Boolean(editing)} onOpenChange={open => { if (!open) setEditing(null); }}>
      <DialogContent><DialogHeader><DialogTitle>Edit employee account</DialogTitle>
        <DialogDescription>Changes are saved to the cloud profile. Authentication credentials are not edited here.</DialogDescription></DialogHeader>
        {editing && <ProfileEditor key={editing.id} record={editing} admin onSaved={() => setEditing(null)} />}
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(entitlement)} onOpenChange={open => { if (!open) setEntitlement(null); }}>
      <DialogContent><DialogHeader><DialogTitle>Leave entitlement</DialogTitle>
        <DialogDescription>Configure annual limits for {entitlement?.full_name || entitlement?.email}.</DialogDescription></DialogHeader>
        {entitlement && <EntitlementEditor key={entitlement.id} record={entitlement} onSaved={() => setEntitlement(null)} />}
      </DialogContent>
    </Dialog>
    {decision && <ReviewDialog key={`${decision.kind}-${decision.record.id}-${decision.approve}`} title={decision.kind === "time" ? "timesheet entry" : "leave request"}
      approve={decision.approve} busy={review.isPending} error={review.error} onClose={() => setDecision(null)} onConfirm={reason => review.mutate(reason)} />}
    <Dialog open={Boolean(roleTarget)} onOpenChange={open => { if (!open && !roleChange.isPending) setRoleTarget(null); }}>
      <DialogContent><DialogHeader><DialogTitle>Change account role?</DialogTitle>
        <DialogDescription>Set {roleTarget?.user.full_name || roleTarget?.user.email} to {roleTarget?.role}. This changes their access rights.</DialogDescription></DialogHeader>
        {roleChange.error && <p role="alert" className="text-red-700">{errorMessage(roleChange.error)}</p>}
        <Button disabled={roleChange.isPending} onClick={() => roleChange.mutate()}>{roleChange.isPending ? "Saving..." : "Confirm role change"}</Button>
      </DialogContent>
    </Dialog>
  </div></MainLayout>;
}

function StatusFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="mb-4"><Label htmlFor="review-status">Show status</Label><select id="review-status" className="block h-10 border rounded bg-white px-3"
    value={value} onChange={e => onChange(e.target.value)}>{["pending", "approved", "rejected", "draft", "all"].map(status => <option key={status} value={status}>{status}</option>)}</select></div>;
}

function ReviewButtons({ pending, own, busy, onApprove, onReject }: {
  pending: boolean; own: boolean; busy: boolean; onApprove: () => void; onReject: () => void;
}) {
  if (!pending) return null;
  if (own) return <span className="text-sm text-gray-600">Another reviewer required</span>;
  return <div className="flex gap-2"><Button size="sm" disabled={busy} onClick={onApprove}>Approve</Button>
    <Button size="sm" variant="outline" disabled={busy} onClick={onReject}>Reject</Button></div>;
}
