
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Clock, History, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { User } from "@/types";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    // Listen for storage changes (for login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  if (!user) return null;
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex gap-2">
            {user.role === "employee" && (
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
              <Link to={user.role === "employee" ? "/timesheet" : "/admin"}>
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
          
          {/* Notification Center */}
          <NotificationCenter />
          
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              {user.name.charAt(0)}
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
