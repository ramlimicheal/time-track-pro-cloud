import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTimesheets } from "@/hooks/useCloudData";
import { MainLayout } from "@/components/layout/MainLayout";
import { WorkTimer } from "@/components/dashboard/WorkTimer";
import { LeavePanel } from "@/components/cloud/LeavePanel";
import { ProfileEditor } from "@/components/cloud/ProfileEditor";
import { QueryState } from "@/components/cloud/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { localDate } from "@/utils/cloudTime";

export default function EmployeeDashboard() {
  const { user, profile } = useAuth();
  const timesheets = useTimesheets();
  const [editProfile, setEditProfile] = useState(false);
  if (!user || !profile) return null;
  const month = localDate().slice(0, 7);
  const records = timesheets.data ?? [];
  const hours = records.filter(row => row.work_date.startsWith(month)).reduce((sum, row) => sum + Number(row.total_hours ?? 0), 0);
  return <MainLayout><div className="space-y-6 py-4">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div><h1 className="text-2xl font-bold">{profile.full_name || "Employee dashboard"}</h1>
        <p className="text-gray-600">{[profile.position, profile.department].filter(Boolean).join(" · ") || "Your work and leave records"}</p></div>
      <Button variant="outline" onClick={() => setEditProfile(true)}>Edit profile</Button>
    </div>
    <QueryState loading={timesheets.isPending} error={timesheets.error} retry={() => void timesheets.refetch()} />
    {!timesheets.isPending && !timesheets.error && <div className="grid gap-4 sm:grid-cols-3">
      {[["Hours this month", hours.toFixed(2)], ["Pending entries", records.filter(row => row.status === "pending").length],
        ["Entries needing revision", records.filter(row => row.status === "rejected").length]].map(([label, value]) =>
        <Card key={label}><CardContent className="pt-6"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-bold">{value}</p></CardContent></Card>)}
    </div>}
    <div className="flex flex-wrap gap-3"><Button asChild><Link to="/timesheet">Enter work hours</Link></Button>
      <Button asChild variant="outline"><Link to="/history">View timesheet history</Link></Button></div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div><WorkTimer employeeId={user.id} employeeName={profile.full_name} /></div>
      <div className="lg:col-span-2"><LeavePanel /></div>
    </div>
    <Dialog open={editProfile} onOpenChange={setEditProfile}>
      <DialogContent><DialogHeader><DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your contact details. Employment details are managed by your administrator.</DialogDescription></DialogHeader>
        <ProfileEditor key={profile.updated_at} record={profile} onSaved={() => setEditProfile(false)} />
      </DialogContent>
    </Dialog>
  </div></MainLayout>;
}
