import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { AccountAccessNotice } from "@/components/auth/AccountAccessNotice";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, passwordRecovery } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      if (passwordRecovery) {
        navigate("/reset-password", { replace: true });
      } else if (profile.role === 'admin' || profile.role === 'manager') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, profile, loading, passwordRecovery, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" role="status" aria-label="Loading account" />
      </main>
    );
  }

  if (user && !profile) return <AccountAccessNotice />;
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Timesheet Management
          </h1>
          <p className="text-gray-600">
            Manage your workforce efficiently
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
};

export default Index;
