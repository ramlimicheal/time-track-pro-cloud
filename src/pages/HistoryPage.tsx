import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTimesheets } from "@/hooks/useCloudData";
import { MainLayout } from "@/components/layout/MainLayout";
import { QueryState } from "@/components/cloud/QueryState";
import { StatusBadge } from "@/components/cloud/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { displayDate } from "@/utils/cloudTime";

export default function HistoryPage() {
  const { profile } = useAuth();
  const query = useTimesheets();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => (query.data ?? []).filter(row =>
    (status === "all" || row.status === status) && (!from || row.work_date >= from) &&
    (!to || row.work_date <= to) && (!search || (row.description ?? "").toLowerCase().includes(search.toLowerCase())),
  ), [query.data, status, from, to, search]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 30) - 1));
  const hours = filtered.reduce((sum, row) => sum + Number(row.total_hours ?? 0), 0);
  return <MainLayout><div className="space-y-5 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div><h1 className="text-2xl font-bold">Timesheet History</h1><p className="text-gray-600">Your cloud records, including approval decisions.</p></div>
      <div className="flex gap-2"><Button variant="outline" onClick={() => window.print()}>Print filtered report</Button>
        <Button asChild><Link to="/timesheet">New entry</Link></Button></div>
    </div>
    <div className="hidden print:block"><h1 className="text-2xl font-bold">Timesheet report: {profile?.full_name}</h1></div>
    <Card><CardHeader><CardTitle>{filtered.length} entries · {hours.toFixed(2)} hours</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5 print:hidden">
          <div><Label htmlFor="history-search">Search description</Label><Input id="history-search" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div>
          <div><Label htmlFor="history-status">Status</Label><select id="history-status" className="w-full h-10 border rounded px-3 bg-white" value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
            {["all", "draft", "pending", "approved", "rejected"].map(value => <option key={value} value={value}>{value}</option>)}</select></div>
          <div><Label htmlFor="history-from">From</Label><Input id="history-from" type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(0); }} /></div>
          <div><Label htmlFor="history-to">To</Label><Input id="history-to" type="date" value={to} onChange={e => { setTo(e.target.value); setPage(0); }} /></div>
        </div>
        {from && to && to < from && <p role="alert" className="mb-3 text-red-700">End date is before the start date.</p>}
        <QueryState loading={query.isPending} error={query.error} retry={() => void query.refetch()} />
        {!query.isPending && !query.error && (filtered.length === 0 ? <p>No entries match this view. <Link to="/timesheet" className="text-blue-700 underline">Create an entry</Link>.</p> : <>
          <div className="print:hidden"><RecordsTable rows={filtered.slice(currentPage * 30, (currentPage + 1) * 30)} /></div>
          <div className="hidden print:block"><RecordsTable rows={filtered} /></div>
          <div className="flex items-center justify-between mt-4 print:hidden">
            <Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button>
            <span>Page {currentPage + 1} of {Math.ceil(filtered.length / 30)}</span>
            <Button variant="outline" disabled={(currentPage + 1) * 30 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next</Button>
          </div>
        </>)}
      </CardContent>
    </Card>
  </div></MainLayout>;
}

function RecordsTable({ rows }: { rows: NonNullable<ReturnType<typeof useTimesheets>["data"]> }) {
  return <Table><TableHeader><TableRow>
    <TableHead>Date</TableHead><TableHead>Work</TableHead><TableHead>Break</TableHead><TableHead>OT</TableHead>
    <TableHead>Hours</TableHead><TableHead>Description / decision</TableHead><TableHead>Status</TableHead><TableHead className="print:hidden">Action</TableHead>
  </TableRow></TableHeader><TableBody>{rows.map(row => <TableRow key={row.id}>
    <TableCell>{displayDate(row.work_date)}</TableCell><TableCell>{row.start_time?.slice(0, 5)}–{row.end_time?.slice(0, 5)}</TableCell>
    <TableCell>{row.break_minutes}m</TableCell><TableCell>{row.ot_start ? `${row.ot_start.slice(0, 5)}–${row.ot_end?.slice(0, 5)}` : "—"}</TableCell>
    <TableCell>{Number(row.total_hours ?? 0).toFixed(2)}</TableCell><TableCell className="max-w-xs break-words">
      {row.description || "—"}{row.rejection_reason && <p className="text-red-700">{row.rejection_reason}</p>}
    </TableCell><TableCell><StatusBadge status={row.status} /></TableCell>
    <TableCell className="print:hidden"><Button asChild size="sm" variant="outline"><Link to={`/timesheet?entry=${row.id}`}>
      {["draft", "rejected"].includes(row.status) ? "Edit" : "View"}
    </Link></Button></TableCell>
  </TableRow>)}</TableBody></Table>;
}
