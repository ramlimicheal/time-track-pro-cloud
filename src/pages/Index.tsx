
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      navigate(userData.role === "employee" ? "/timesheet" : "/admin");
    }
  }, [navigate]);

  return <Login />;
};

export default Index;
