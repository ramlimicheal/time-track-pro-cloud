import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { LeaveManagementDashboard } from "@/components/admin/LeaveManagementDashboard";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { ReportsSection } from "@/components/admin/ReportsSection";
import { Employee } from "@/types";

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<
    "users" | "leave" | "employees" | "timesheet" | "reports" | "profile" | "overview"
  >("overview");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "users"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("users")}
          >
            Manage Users
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "employees"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("employees")}
          >
            Manage Employees
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
              activeSection === "timesheet"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("timesheet")}
          >
            Timesheet Review
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeSection === "reports"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveSection("reports")}
          >
            Reports
          </button>
        </div>

        {(() => {
          switch (activeSection) {
            case "users":
              return <UserManagement />;
              
            case "leave":
              return <LeaveManagementDashboard />;
              
            case "employees":
              return <EmployeeManagement employees={employees} onEmployeeUpdate={fetchEmployees} />;
              
            case "timesheet":
              return <TimesheetReview 
                employee={null}
                entries={[]}
                timesheetStatus="pending"
                onBack={() => setActiveSection("overview")}
                onSubmit={() => {}}
                onApprove={() => {}}
                onReject={() => {}}
              />;
              
            case "reports":
              return <ReportsSection employees={employees} />;
              
            case "profile":
              return <EmployeeManagement employees={employees} onEmployeeUpdate={fetchEmployees} />;

            default:
              return <div>Overview Section</div>;
          }
        })()}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
