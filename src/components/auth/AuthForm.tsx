import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "./GoogleIcon";
import { errorMessage } from "@/lib/errors";

export function AuthForm() {
  const { signIn, resetPassword, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSent(false);
    try {
      if (reset) { await resetPassword(email); setSent(true); }
      else await signIn(email, password);
    } catch (failure) { setError(errorMessage(failure, "Sign-in failed")); }
    finally { setBusy(false); }
  }

  async function googleSignIn() {
    setBusy(true);
    setError("");
    try { await signInWithOAuth("google"); }
    catch (failure) { setError(errorMessage(failure, "Google sign-in failed")); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">{reset ? "Reset password" : "Welcome Back"}</CardTitle>
        <CardDescription>{reset ? "Request a password reset link." : "Sign in with your invited account."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {sent && <p role="status" className="text-sm text-green-700">If an account exists, a reset link will be sent. Check your email.</p>}
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" autoComplete="username" value={email}
              onChange={event => setEmail(event.target.value)} required disabled={busy} />
          </div>
          {!reset && <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input id="auth-password" type="password" autoComplete="current-password" value={password}
              onChange={event => setPassword(event.target.value)} required disabled={busy} />
          </div>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait..." : reset ? "Send reset link" : "Sign In"}
          </Button>
          <Button type="button" variant="link" disabled={busy}
            onClick={() => { setReset(!reset); setError(""); setSent(false); }}>
            {reset ? "Back to sign in" : "Forgot password?"}
          </Button>
          {!reset && <>
            <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => void googleSignIn()}>
              <GoogleIcon className="mr-2 h-4 w-4" />Continue with Google
            </Button>
            <p className="text-sm text-gray-600">Need an account? Ask your administrator for an invitation.</p>
          </>}
        </form>
      </CardContent>
    </Card>
  );
}
