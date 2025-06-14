
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginFormProps {
  userType: "employee" | "admin";
}

export const LoginForm = ({ userType }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (userType === "employee") {
        // Check if this username/password matches any admin-created employees
        const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
        const matchingEmployee = storedEmployees.find(
          (emp: any) => emp.username === username && emp.password === password
        );
        
        if (matchingEmployee) {
          const user = {
            id: matchingEmployee.id,
            name: matchingEmployee.name,
            email: matchingEmployee.email,
            role: "employee"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard");
          toast.success("Login successful");
        } else {
          toast.error("Invalid credentials");
        }
      } else {
        // For admin login, check if any admin accounts exist
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const matchingAdmin = storedUsers.find(
          (user: any) => user.username === username && user.password === password && user.role === "admin"
        );
        
        if (matchingAdmin) {
          const user = {
            id: matchingAdmin.id,
            name: matchingAdmin.username,
            email: matchingAdmin.email,
            role: "admin"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/admin");
          toast.success("Login successful");
        } else if (storedUsers.length === 0 && username === "setup" && password === "setup") {
          const user = {
            id: "setup-admin",
            name: "Setup Admin",
            email: "setup@example.com",
            role: "admin"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/admin");
          toast.success("Welcome to first-time setup! Please create an admin account.");
        } else {
          toast.error("Invalid credentials");
        }
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        {/* Username Field */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Username
          </label>
          <div className="relative group">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="pl-10 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-transparent focus:ring-2 focus:ring-blue-500/50 rounded-xl transition-all duration-300 group-hover:bg-white/80"
            />
            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>
        
        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock size={16} className="text-gray-500" />
              Password
            </label>
            <button 
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="pl-10 pr-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 focus:border-transparent focus:ring-2 focus:ring-blue-500/50 rounded-xl transition-all duration-300 group-hover:bg-white/80"
            />
            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>
      </div>
      
      {/* Login Button */}
      <Button 
        type="submit" 
        className={`w-full h-12 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group ${
          userType === "employee" 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
            : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        }`}
        disabled={isLoading}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Logging in...
            </>
          ) : (
            <>
              <Lock size={18} />
              Log in
            </>
          )}
        </span>
      </Button>
      
      {/* Helper Text */}
      <div className="text-xs text-center text-gray-500 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
        {userType === "employee" ? (
          <div className="space-y-1">
            <p className="font-medium">👤 Employee Access</p>
            <p>Use your username and password provided by your administrator.</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium">🛡️ Administrator Access</p>
            <p>If no admin account exists, use <span className="font-mono bg-gray-200 px-1 rounded">setup</span> / <span className="font-mono bg-gray-200 px-1 rounded">setup</span> for first-time setup.</p>
          </div>
        )}
      </div>
    </form>
  );
};
