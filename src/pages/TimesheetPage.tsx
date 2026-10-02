import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTimesheets } from "@/hooks/useCloudData";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimeEntryForm } from "@/components/cloud/TimeEntryForm";
import { UnsavedChangesDialog } from "@/components/cloud/UnsavedChangesDialog";
import { QueryState } from "@/components/cloud/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TimesheetPage() {
  const [params, setParams] = useSearchParams();
  const id = params.get("entry");
  const query = useTimesheets();
  const [dirty, setDirty] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [resetRequested, setResetRequested] = useState(false);
  const blocker = useUnsavedChanges(dirty);
  const record = id ? query.data?.find(row => row.id === id) : undefined;
  useEffect(() => {
    if (!resetRequested) return;
    // Navigate only after the confirmed discard has cleared the dirty blocker.
    if (id) setParams({});
    setResetRequested(false);
  }, [resetRequested, id, setParams]);
  function newEntry() {
    // New means a new form, never deletion of cloud or legacy browser history.
    setDirty(false);
    setConfirmNew(false);
    setResetRequested(true);
    setFormVersion(version => version + 1);
  }
  return <MainLayout>
    <div className="space-y-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Timesheet</h1><p className="text-gray-600">Record daily hours and submit them for review.</p></div>
        <Button variant="outline" onClick={() => dirty ? setConfirmNew(true) : newEntry()}>New Timesheet</Button>
      </div>
      <QueryState loading={query.isPending} error={query.error} retry={() => void query.refetch()} />
      {!query.isPending && !query.error && (id && !record ? <p role="alert">This entry was not found or is not yours.</p> :
        <Card><CardHeader><CardTitle>{record ? "Timesheet entry" : "New daily entry"}</CardTitle></CardHeader>
          <CardContent><TimeEntryForm key={`${id ?? "new"}-${formVersion}`} record={record}
            onDirtyChange={setDirty} onSaved={() => setFormVersion(version => version + 1)} /></CardContent>
        </Card>)}
    </div>
    <UnsavedChangesDialog blocker={blocker} />
    <Dialog open={confirmNew} onOpenChange={setConfirmNew}>
      <DialogContent><DialogHeader><DialogTitle>Discard this unsaved entry?</DialogTitle>
        <DialogDescription>Saved history will not be changed. Only the unsaved form will be reset.</DialogDescription></DialogHeader>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setConfirmNew(false)}>Keep editing</Button>
          <Button variant="destructive" onClick={newEntry}>Discard and start new</Button></div>
      </DialogContent>
    </Dialog>
  </MainLayout>;
}
