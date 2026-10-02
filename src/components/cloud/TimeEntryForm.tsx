import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshWorkforce } from "@/hooks/useCloudData";
import { timesheetService } from "@/services/timesheetService";
import type { TimeEntryInput, TimeRecord } from "@/types/cloud";
import { emptyTimeInput, recordTimeInput, totalTimeHours } from "@/utils/cloudTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/errors";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";

export function TimeEntryForm({ record, onSaved, onDirtyChange }: {
  record?: TimeRecord; onSaved?: () => void; onDirtyChange?: (dirty: boolean) => void;
}) {
  const { user } = useAuth();
  const refresh = useRefreshWorkforce();
  const [input, setInput] = useState<TimeEntryInput>(() => record ? recordTimeInput(record) : emptyTimeInput());
  const [dirty, setDirty] = useState(false);
  const editable = !record || record.status === "draft" || record.status === "rejected";
  const mutation = useMutation({
    mutationFn: () => timesheetService.submit(user!.id, input, record),
    onSuccess: async () => {
      setDirty(false);
      onDirtyChange?.(false);
      await refresh();
      toast.success("Entry saved to the cloud and submitted for approval.");
      onSaved?.();
    },
  });
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  const disabled = !editable || mutation.isPending;
  function change<K extends keyof TimeEntryInput>(field: K, value: TimeEntryInput[K]) {
    if (disabled) return;
    setInput(previous => ({ ...previous, [field]: value }));
    setDirty(true);
    mutation.reset();
  }
  function submit(event: FormEvent) { event.preventDefault(); if (!disabled && !mutation.isPending) mutation.mutate(); }
  return <form onSubmit={submit} className="space-y-5">
    {record && <div className="flex items-center gap-3">
      <StatusBadge status={record.status} />
      {!editable && <p className="text-sm text-gray-600">Submitted entries are locked during review and after approval.</p>}
    </div>}
    {record?.rejection_reason && <p className="rounded bg-red-50 p-3 text-red-700">Revision requested: {record.rejection_reason}</p>}
    {mutation.error && <p role="alert" className="text-red-700">{errorMessage(mutation.error)}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="work-date">Work date</Label>
        <Input id="work-date" type="date" value={input.work_date} required disabled={disabled || Boolean(record)}
          onChange={event => change("work_date", event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="work-start">Work start</Label>
        <Input id="work-start" type="time" value={input.start_time} required disabled={disabled}
          onChange={event => change("start_time", event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="work-end">Work end</Label>
        <Input id="work-end" type="time" value={input.end_time} required disabled={disabled}
          onChange={event => change("end_time", event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="break-minutes">Break minutes</Label>
        <Input id="break-minutes" type="number" min={0} max={1439} step={1} value={input.break_minutes} required disabled={disabled}
          onChange={event => change("break_minutes", event.target.value === "" ? 0 : Number(event.target.value))} /></div>
      <div className="space-y-2"><Label htmlFor="ot-start">Overtime start (optional)</Label>
        <Input id="ot-start" type="time" value={input.ot_start} disabled={disabled}
          onChange={event => change("ot_start", event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="ot-end">Overtime end (optional)</Label>
        <Input id="ot-end" type="time" value={input.ot_end} disabled={disabled}
          onChange={event => change("ot_end", event.target.value)} /></div>
    </div>
    <div className="space-y-2"><Label htmlFor="work-description">Work description</Label>
      <Textarea id="work-description" maxLength={2000} value={input.description} disabled={disabled}
        onChange={event => change("description", event.target.value)} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-medium">Total: {totalTimeHours(input).toFixed(2)} hours</p>
      {editable && <Button type="submit" disabled={mutation.isPending || !user}>
        {mutation.isPending ? "Submitting..." : record ? "Resubmit for approval" : "Submit for approval"}
      </Button>}
    </div>
    <p className="text-sm text-gray-600">An end time earlier than the start is treated as next day. Overtime follows the regular shift.</p>
  </form>;
}
