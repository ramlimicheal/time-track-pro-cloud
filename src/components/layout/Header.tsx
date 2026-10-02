import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  async function logout() {
    try { await signOut(); navigate("/", { replace: true }); }
    catch (error) { toast.error(errorMessage(error, "Could not sign out.")); }
  }
  if (!user || !profile) return null;
  return <header className="bg-white border-b px-4 py-3 print:hidden">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <Logo />
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-sm">{profile.full_name}</span>
        <NotificationCenter />
        <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
      </div>
      <nav aria-label="Main navigation" className="flex flex-wrap gap-1 w-full">
        <Button variant="ghost" size="sm" asChild><Link to={profile.role === "employee" ? "/dashboard" : "/admin"}>Dashboard</Link></Button>
        <Button variant="ghost" size="sm" asChild><Link to="/timesheet">Timesheet</Link></Button>
        <Button variant="ghost" size="sm" asChild><Link to="/history">History</Link></Button>
      </nav>
    </div>
  </header>;
}
