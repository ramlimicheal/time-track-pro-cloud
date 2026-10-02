import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { errorMessage } from "@/lib/errors";

export function ReviewDialog({ title, approve, busy, error, onClose, onConfirm }: {
  title: string; approve: boolean; busy: boolean; error: unknown; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!busy) onConfirm(reason); }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent><DialogHeader><DialogTitle>{approve ? "Approve" : "Reject"} {title}</DialogTitle>
      <DialogDescription>{approve ? "This decision will be saved to the cloud. Approved records are locked." : "Explain the correction required."}</DialogDescription>
    </DialogHeader><form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="text-red-700">{errorMessage(error)}</p>}
      {!approve && <div><Label htmlFor="review-reason">Rejection reason</Label>
        <Textarea id="review-reason" required maxLength={2000} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} /></div>}
      <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
        <Button type="submit" variant={approve ? "default" : "destructive"} disabled={busy}>{busy ? "Saving..." : "Confirm decision"}</Button></DialogFooter>
    </form></DialogContent>
  </Dialog>;
}
