
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
      navigate(userData.role === "employee" ? "/dashboard" : "/admin");
    }
  }, [navigate]);

  return (
    <MainLayout requireAuth={false}>
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-100/30 to-purple-100/40"></div>
        
        {/* Animated floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/25 to-indigo-400/25 rounded-full blur-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl"></div>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <Logo />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to TimeTrack Pro
          </h1>
          <p className="mt-2 text-gray-600 text-center max-w-md">
            Professional timesheet management made simple and efficient
          </p>
        </div>
        
        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-md">
          <div className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Main card */}
            <div className="relative backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-50"></div>
              
              <div className="relative z-10">
                <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
                
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-600 mt-1">
                    Log in to manage your timesheets and track your hours
                  </p>
                </div>
                
                <div className="mt-8">
                  <LoginForm userType={activeTab} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="text-center p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Time Tracking</h3>
            <p className="text-sm text-gray-600 mt-1">Accurate and easy time logging</p>
          </div>
          
          <div className="text-center p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Comprehensive reporting tools</p>
          </div>
          
          <div className="text-center p-4 backdrop-blur-sm bg-white/40 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Team Management</h3>
            <p className="text-sm text-gray-600 mt-1">Efficient workforce coordination</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
