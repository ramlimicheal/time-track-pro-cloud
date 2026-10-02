import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { leaveService } from "@/services/leaveService";
import { useRefreshWorkforce } from "@/hooks/useCloudData";
import type { LeaveBalance, ProfileRow } from "@/types/cloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryState } from "./QueryState";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function EntitlementEditor({ record, onSaved }: { record: ProfileRow; onSaved: () => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const balance = useQuery({ queryKey: ["balances", record.id, year], queryFn: () => leaveService.balances(record.id, year) });
  return <div className="space-y-4">
    <div><Label htmlFor="entitlement-year">Year</Label><Input id="entitlement-year" type="number" min={2020} max={2100}
      value={year} onChange={event => setYear(Number(event.target.value))} /></div>
    <QueryState loading={balance.isPending} error={balance.error} retry={() => void balance.refetch()} />
    {!balance.isPending && !balance.error && <EntitlementForm key={`${year}-${balance.data?.updated_at ?? "new"}`}
      record={record} year={year} balance={balance.data} onSaved={onSaved} />}
  </div>;
}

function EntitlementForm({ record, year, balance, onSaved }: {
  record: ProfileRow; year: number; balance: LeaveBalance | null; onSaved: () => void;
}) {
  const refresh = useRefreshWorkforce();
  const [days, setDays] = useState({ annual: balance?.annual ?? 0, sick: balance?.sick ?? 0, casual: balance?.casual ?? 0 });
  const mutation = useMutation({
    mutationFn: () => leaveService.setEntitlement(record.id, year, days),
    onSuccess: async () => { await refresh(); toast.success("Leave entitlement saved."); onSaved(); },
  });
  function submit(event: FormEvent) { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }
  return <form onSubmit={submit} className="space-y-4">
    {mutation.error && <p role="alert" className="text-red-700">{errorMessage(mutation.error)}</p>}
    {(["annual", "sick", "casual"] as const).map(type => <div key={type}>
      <Label htmlFor={`entitlement-${type}`} className="capitalize">{type} days</Label>
      <Input id={`entitlement-${type}`} type="number" min={0} max={366} step={1} required value={days[type]}
        disabled={mutation.isPending} onChange={event => setDays({ ...days, [type]: Number(event.target.value) })} />
    </div>)}
    <p className="text-sm text-gray-600">Enter the total annual entitlement, not the remaining balance.
      Approved leave is counted separately. Confirm these limits against your company and country policy.</p>
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save entitlement"}</Button>
  </form>;
}
