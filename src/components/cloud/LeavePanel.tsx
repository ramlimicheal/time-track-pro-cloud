import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLeaves, useRefreshWorkforce } from "@/hooks/useCloudData";
import { leaveService } from "@/services/leaveService";
import type { LeaveInput, LeaveType } from "@/types/cloud";
import { displayDate, leaveDays, leaveDaysInYear } from "@/utils/cloudTime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QueryState } from "./QueryState";
import { StatusBadge } from "./StatusBadge";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function LeavePanel() {
  const { user } = useAuth();
  const leaves = useLeaves();
  const refresh = useRefreshWorkforce();
  const year = new Date().getFullYear();
  const balance = useQuery({
    queryKey: ["balances", user?.id, year],
    queryFn: () => leaveService.balances(user!.id, year),
    enabled: Boolean(user),
  });
  const [input, setInput] = useState<LeaveInput>({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
  const mutation = useMutation({
    mutationFn: () => leaveService.submit(user!.id, input),
    onSuccess: async () => {
      await refresh();
      setInput({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
      toast.success("Leave request saved to the cloud.");
    },
  });
  function submit(event: FormEvent) { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }
  return <div className="space-y-5">
    <Card><CardHeader><CardTitle>Leave balance · {year}</CardTitle></CardHeader><CardContent>
      <QueryState loading={balance.isPending || leaves.isPending} error={balance.error || leaves.error}
        retry={() => { void balance.refetch(); void leaves.refetch(); }} />
      {!balance.isPending && !leaves.isPending && !balance.error && !leaves.error && (balance.data ?
        <div className="grid grid-cols-3 gap-3">{(["annual", "sick", "casual"] as const).map(type => {
          const used = (leaves.data ?? []).filter(row => row.status === "approved" && row.leave_type === type)
            .reduce((sum, row) => sum + leaveDaysInYear(row.start_date, row.end_date, year), 0);
          return <div key={type} className="rounded bg-gray-50 p-3">
            <p className="capitalize font-medium">{type}</p><p>{Math.max(0, balance.data![type] - used)} days remaining</p>
            <p className="text-sm text-gray-600">{used} used / {balance.data![type]} entitlement</p>
          </div>;
        })}</div> : <p>Leave entitlements have not been configured by your administrator.</p>)}
      <p className="mt-3 text-sm text-gray-600">This foundation counts calendar days. Country-specific holiday and payroll policies will be added separately.</p>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Apply for leave</CardTitle></CardHeader><CardContent>
      <form onSubmit={submit} className="space-y-4">
        {mutation.error && <p role="alert" className="text-red-700">{errorMessage(mutation.error)}</p>}
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label htmlFor="leave-type">Leave type</Label><select id="leave-type" className="w-full h-10 border rounded bg-white px-3"
            value={input.leave_type} disabled={mutation.isPending} onChange={e => setInput({ ...input, leave_type: e.target.value as LeaveType })}>
            {["annual", "sick", "casual", "unpaid", "other"].map(type => <option key={type} value={type}>{type}</option>)}</select></div>
          <div><Label htmlFor="leave-start">Start date</Label><Input id="leave-start" type="date" value={input.start_date} required
            disabled={mutation.isPending} onChange={e => setInput({ ...input, start_date: e.target.value })} /></div>
          <div><Label htmlFor="leave-end">End date</Label><Input id="leave-end" type="date" value={input.end_date} required min={input.start_date || undefined}
            disabled={mutation.isPending} onChange={e => setInput({ ...input, end_date: e.target.value })} /></div>
        </div>
        <div><Label htmlFor="leave-reason">Reason</Label><Textarea id="leave-reason" value={input.reason} required maxLength={2000}
          disabled={mutation.isPending} onChange={e => setInput({ ...input, reason: e.target.value })} /></div>
        <p>{leaveDays(input.start_date, input.end_date)} calendar days requested</p>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Submit leave request"}</Button>
      </form>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Your leave requests</CardTitle></CardHeader><CardContent className="space-y-3">
      <QueryState loading={leaves.isPending} error={leaves.error} retry={() => void leaves.refetch()} />
      {!leaves.isPending && !leaves.error && (leaves.data?.length ? leaves.data.map(row => <div key={row.id} className="border rounded p-3">
        <div className="flex flex-wrap justify-between gap-2"><p className="capitalize">{row.leave_type}: {displayDate(row.start_date)} to {displayDate(row.end_date)}</p>
          <StatusBadge status={row.status} /></div><p className="text-sm text-gray-600">{row.days} days · {row.reason}</p>
        {row.rejection_reason && <p className="text-sm text-red-700">{row.rejection_reason}</p>}
      </div>) : <p>No leave requests yet.</p>)}
    </CardContent></Card>
  </div>;
}
