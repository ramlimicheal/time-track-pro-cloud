import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { errorMessage } from "@/lib/errors";

export default function ResetPassword() {
  const { user, loading, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    setError("");
    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      await signOut();
      navigate("/", { replace: true });
    } catch (failure) { setError(errorMessage(failure, "Could not update your password.")); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle as="h1">Set your password</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p role="status">Checking your link...</p> : !user ? <>
          <p className="mb-4">This link is missing or expired. Request a new password reset link.</p>
          <Button asChild><Link to="/">Return to sign in</Link></Button>
        </> : <form onSubmit={submit} className="space-y-4">
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" minLength={12}
              value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} />
          </div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" minLength={12}
              value={confirm} onChange={event => setConfirm(event.target.value)} required disabled={busy} />
          </div>
          <p className="text-sm text-gray-600">Use at least 12 characters. You will sign in again after saving.</p>
          <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Update password"}</Button>
        </form>}
      </CardContent>
    </Card>
  </main>;
}
