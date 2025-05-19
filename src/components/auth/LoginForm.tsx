
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
      // In a real app, this would be an API call to validate credentials
      if (userType === "employee") {
        // First check if this username/password matches any admin-created employees
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
        } else if (username === "john" && password === "password") {
          // Fallback to default demo account
          const user = {
            id: "emp-123",
            name: "John Employee",
            email: "john@example.com",
            role: "employee"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard");
          toast.success("Login successful");
        } else {
          toast.error("Invalid credentials");
        }
      } else {
        if (username === "admin" && password === "admin123") {
          const user = {
            id: "adm-123",
            name: "Admin User",
            email: "admin@example.com",
            role: "manager"
          };
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/admin");
          toast.success("Login successful");
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
          placeholder={userType === "employee" ? "Enter your username" : "admin"}
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
          <>
            <p>Created by admin? Use your assigned username and password.</p>
            <p>Or use demo: "john" and password: "password"</p>
          </>
        ) : (
          <span>Use username: "admin" and password: "admin123"</span>
        )}
      </div>
    </form>
  );
};
