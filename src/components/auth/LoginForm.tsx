
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LoginFormProps {
  userType: "employee" | "admin";
}

export const LoginForm = ({ userType }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
          // Create user object from employee data
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
          (user: any) => user.username === username && user.password === password && user.role === "manager"
        );
        
        if (matchingAdmin) {
          const user = {
            id: matchingAdmin.id,
            name: matchingAdmin.name,
            email: matchingAdmin.email,
            role: "admin"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/admin");
          toast.success("Login successful");
        } else if (username === "setup" && password === "setup") {
          // First-time setup account for creating admin
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
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
      
      <div className="text-xs text-center text-gray-500 mt-4">
        {userType === "employee" ? (
          <p>Use your username and password provided by your administrator.</p>
        ) : (
          <div className="space-y-1">
            <p>Default admin: username "admin", password "admin123"</p>
            <p>Or use "setup" / "setup" for first-time setup.</p>
          </div>
        )}
      </div>
    </form>
  );
};
