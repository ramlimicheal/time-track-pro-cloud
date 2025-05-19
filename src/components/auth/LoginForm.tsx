
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LoginFormProps {
  userType: "employee" | "admin";
}

export const LoginForm: React.FC<LoginFormProps> = ({ userType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login logic
    setTimeout(() => {
      if (email === "john@example.com") {
        localStorage.setItem("user", JSON.stringify({
          id: "1",
          name: "John Employee",
          email: "john@example.com",
          role: userType
        }));
        
        toast.success("Login successful");
        navigate(userType === "employee" ? "/timesheet" : "/admin");
      } else {
        toast.error("Invalid credentials. Try john@example.com with any password.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            @
          </span>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="pl-8"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <div className="text-right">
          <a href="#" className="text-sm text-timetrack-blue hover:underline">
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-timetrack-blue hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>For demo purposes, try:</p>
        <p className="font-mono">john@example.com (any password)</p>
      </div>
    </form>
  );
};
