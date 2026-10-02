import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
const TimesheetPage = lazy(() => import("./pages/TimesheetPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } });
const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/timesheet", element: <ProtectedRoute><TimesheetPage /></ProtectedRoute> },
  { path: "/history", element: <ProtectedRoute><HistoryPage /></ProtectedRoute> },
  { path: "/dashboard", element: <ProtectedRoute><EmployeeDashboard /></ProtectedRoute> },
  { path: "/admin", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><AdminPage /></ProtectedRoute> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><AuthProvider><TooltipProvider>
    <Suspense fallback={<p role="status" className="p-6 text-gray-600">Loading page...</p>}>
      <RouterProvider router={router} />
    </Suspense>
    <Toaster /><Sonner />
  </TooltipProvider></AuthProvider></QueryClientProvider></ErrorBoundary>;
}
