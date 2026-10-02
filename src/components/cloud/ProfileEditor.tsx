import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshWorkforce } from "@/hooks/useCloudData";
import type { ProfileRow, ProfileInput } from "@/types/cloud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function ProfileEditor({ record, admin = false, onSaved }: {
  record: ProfileRow; admin?: boolean; onSaved?: () => void;
}) {
  const { user, refreshProfile } = useAuth();
  const refresh = useRefreshWorkforce();
  const [input, setInput] = useState<ProfileInput>({
    full_name: record.full_name, phone: record.phone, department: record.department, position: record.position,
  });
  const mutation = useMutation({
    mutationFn: () => employeeService.update(record.id, input, admin),
    onSuccess: async () => {
      await refresh();
      if (user?.id === record.id) await refreshProfile();
      toast.success("Profile saved to the cloud.");
      onSaved?.();
    },
  });
  function submit(event: FormEvent) { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }
  return <form onSubmit={submit} className="space-y-4">
    {mutation.error && <p role="alert" className="text-red-700">{errorMessage(mutation.error)}</p>}
    <div><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" value={input.full_name}
      maxLength={120} required disabled={mutation.isPending} onChange={e => setInput({ ...input, full_name: e.target.value })} /></div>
    <div><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" value={input.phone ?? ""}
      maxLength={40} disabled={mutation.isPending} onChange={e => setInput({ ...input, phone: e.target.value })} /></div>
    <div><Label htmlFor="profile-department">Department</Label><Input id="profile-department" value={input.department ?? ""}
      maxLength={120} disabled={!admin || mutation.isPending} onChange={e => setInput({ ...input, department: e.target.value })} /></div>
    <div><Label htmlFor="profile-position">Position / trade</Label><Input id="profile-position" value={input.position ?? ""}
      maxLength={120} disabled={!admin || mutation.isPending} onChange={e => setInput({ ...input, position: e.target.value })} /></div>
    <p className="text-sm text-gray-600">Email and passwords are managed by authentication, never stored in employee records.</p>
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save profile"}</Button>
  </form>;
}
