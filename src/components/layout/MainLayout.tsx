
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
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">{children}</main>
      <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        © 2025 TimeTrack Pro. All rights reserved.
      </footer>
    </div>
  );
};
