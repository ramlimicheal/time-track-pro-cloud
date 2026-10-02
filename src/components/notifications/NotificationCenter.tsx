import { Bell } from "lucide-react";
import { useTimesheets, useLeaves } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QueryState } from "@/components/cloud/QueryState";
import { displayDate } from "@/utils/cloudTime";

export function NotificationCenter() {
  const timesheets = useTimesheets();
  const leaves = useLeaves();
  const updates = [
    ...(timesheets.data ?? []).filter(row => ["approved", "rejected"].includes(row.status)).map(row => ({
      id: row.id, date: row.updated_at, text: `Timesheet ${displayDate(row.work_date)}: ${row.status}`,
    })),
    ...(leaves.data ?? []).filter(row => ["approved", "rejected"].includes(row.status)).map(row => ({
      id: row.id, date: row.updated_at, text: `Leave ${displayDate(row.start_date)}: ${row.status}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  return <Popover><PopoverTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Recent approval updates"><Bell className="h-5 w-5" /></Button>
  </PopoverTrigger><PopoverContent align="end" className="w-80">
    <h2 className="font-semibold mb-3">Recent approval updates</h2>
    <QueryState loading={timesheets.isPending || leaves.isPending} error={timesheets.error || leaves.error}
      retry={() => { void timesheets.refetch(); void leaves.refetch(); }} />
    {!timesheets.isPending && !leaves.isPending && !timesheets.error && !leaves.error &&
      (updates.length ? <ul className="space-y-3">{updates.map(update => <li key={update.id} className="text-sm border-b pb-2">
        {update.text}<p className="text-xs text-gray-600">{new Date(update.date).toLocaleString()}</p>
      </li>)}</ul> : <p className="text-sm text-gray-600">No decisions yet.</p>)}
  </PopoverContent></Popover>;
}
