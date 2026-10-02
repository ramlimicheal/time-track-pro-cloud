import type { ReactNode } from "react";
import { Header } from "./Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function MainLayout({ children, requireAuth = true }: { children: ReactNode; requireAuth?: boolean }) {
  const layout = (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {requireAuth && <Header />}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">{children}</main>
      <footer className="p-4 text-center text-sm text-gray-600 border-t bg-white">
        © {new Date().getFullYear()} TimeTrack Pro. All rights reserved.
      </footer>
    </div>
  );
  return requireAuth ? <ProtectedRoute>{layout}</ProtectedRoute> : layout;
}
