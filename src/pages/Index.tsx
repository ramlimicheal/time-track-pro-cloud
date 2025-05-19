
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is first launch (implement a flag in localStorage)
    const hasLaunched = localStorage.getItem("hasLaunched");
    
    if (!hasLaunched) {
      // First time launching app - clear any existing data
      Object.keys(localStorage).forEach(key => {
        // Don't clear certain configuration items if needed
        localStorage.removeItem(key);
      });
      
      // Set flag to indicate app has launched
      localStorage.setItem("hasLaunched", "true");
    }
    
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      navigate(userData.role === "employee" ? "/dashboard" : "/admin");
    }
  }, [navigate]);

  return <Login />;
};

export default Index;
