import type { Blocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function UnsavedChangesDialog({ blocker }: { blocker: Blocker }) {
  return <Dialog open={blocker.state === "blocked"} onOpenChange={open => {
    if (!open && blocker.state === "blocked") blocker.reset();
  }}>
    <DialogContent>
      <DialogHeader><DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogDescription>Your changes have not been saved to the cloud.</DialogDescription></DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => blocker.state === "blocked" && blocker.reset()}>Keep editing</Button>
        <Button variant="destructive" onClick={() => blocker.state === "blocked" && blocker.proceed()}>Discard changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
