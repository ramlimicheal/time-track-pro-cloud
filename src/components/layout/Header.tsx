import { useNavigate, Link } from "react-router-dom";
import { LogOut, Clock, History, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user || !profile) return null;
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex gap-2">
            {profile.role === "employee" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 hover:text-gray-900"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 hover:text-gray-900"
            >
              <Link to={profile.role === "employee" ? "/timesheet" : "/admin"}>
                <Clock className="mr-1 h-4 w-4" />
                <span>Timesheet</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 hover:text-gray-900"
            >
              <Link to="/history">
                <History className="mr-1 h-4 w-4" />
                <span>History</span>
              </Link>
            </Button>
          </div>

          <NotificationCenter />

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">{profile.full_name}</div>
              <div className="text-xs text-muted-foreground capitalize">{profile.role}</div>
            </div>

            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hidden md:flex"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
