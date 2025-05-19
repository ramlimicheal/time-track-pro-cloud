
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/Logo";
import { MainLayout } from "@/components/layout/MainLayout";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"employee" | "admin">("employee");
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      navigate(userData.role === "employee" ? "/timesheet" : "/admin");
    }
  }, [navigate]);

  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <Logo />
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-1">
                Log in to manage your timesheets and track your hours
              </p>
            </div>
            
            <div className="mt-6">
              <LoginForm userType={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
