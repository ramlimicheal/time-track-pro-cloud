
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (requireAuth) {
      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/");
      }
    }
  }, [requireAuth, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {requireAuth && <Header />}
      <div className="absolute inset-0 top-[60px] bottom-[60px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full relative z-10">{children}</main>
      <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white relative z-10">
        © 2025 TimeTrack Pro. All rights reserved.
      </footer>
    </div>
  );
};
