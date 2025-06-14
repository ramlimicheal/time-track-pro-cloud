import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { LeaveManagementDashboard } from "@/components/admin/LeaveManagementDashboard";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { ReportsSection } from "@/components/admin/ReportsSection";
import { SetupGuide } from "@/components/admin/SetupGuide";
import { Employee } from "@/types";
import { AdvancedUserManagement } from "@/components/admin/AdvancedUserManagement";
import { AuditTrail } from "@/components/admin/AuditTrail";
import { SmartTimesheetManagement } from "@/components/admin/SmartTimesheetManagement";

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<
    "users" | "leave" | "employees" | "timesheet" | "reports" | "profile" | "overview" | "audit" | "advanced"
  >("overview");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    fetchEmployees();
    checkFirstTimeSetup();
  }, []);

  const checkFirstTimeSetup = () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Show setup guide if user is setup-admin and no real admin accounts exist
    if (currentUser.id === "setup-admin" && storedUsers.length === 0) {
      setShowSetupGuide(true);
      setActiveSection("users");
    }
  };

  const fetchEmployees = () => {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  };

  const handleCreateFirstAdmin = () => {
    setShowSetupGuide(false);
    setActiveSection("users");
  };

  if (showSetupGuide) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <SetupGuide onCreateFirstAdmin={handleCreateFirstAdmin} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Advanced Admin Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "overview"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "users"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("users")}
          >
            User Management
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "employees"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("employees")}
          >
            Employee Management
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "advanced"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("advanced")}
          >
            Smart Timesheets
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "leave"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("leave")}
          >
            Leave Management
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "reports"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("reports")}
          >
            Reports & Analytics
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "audit"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("audit")}
          >
            Security Audit
          </button>
        </div>

        {(() => {
          switch (activeSection) {
            case "users":
              return <AdvancedUserManagement />;
              
            case "leave":
              return <LeaveManagementDashboard />;
              
            case "employees":
              return <EmployeeManagement employees={employees} />;
              
            case "advanced":
              return <SmartTimesheetManagement employees={employees} />;
              
            case "timesheet":
              return <TimesheetReview 
                employee={undefined}
                entries={[]}
                timesheetStatus="pending"
                onBack={() => setActiveSection("overview")}
                onApprove={() => {}}
                onReject={() => {}}
                onGeneratePDF={() => {}}
              />;
              
            case "reports":
              return <ReportsSection employees={employees} />;
              
            case "audit":
              return <AuditTrail />;

            case "profile":
              return <EmployeeManagement employees={employees} />;

            default:
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
                    <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-2">Pending Timesheets</h3>
                    <p className="text-3xl font-bold text-yellow-600">12</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-green-600">8</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-2">This Month Hours</h3>
                    <p className="text-3xl font-bold text-purple-600">1,247</p>
                  </div>
                </div>
              );
          }
        })()}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
