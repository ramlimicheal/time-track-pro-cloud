
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { TimesheetAnalytics } from "@/components/admin/TimesheetAnalytics";
import { PendingTimesheetsTable } from "@/components/admin/PendingTimesheetsTable";
import { LeaveApplicationsReview } from "@/components/admin/LeaveApplicationsReview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, TimesheetEntry } from "@/types";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [timesheetStatus, setTimesheetStatus] = useState<"pending" | "approved" | "rejected">("pending");
  
  // Load employee data from localStorage
  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
  }, []);
  
  // Handler for selecting an employee to review timesheet
  const handleSelectEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    setActiveTab("timesheets");
    
    // In a real app, fetch the employee's timesheet entries
    // For now, using mock data
    setTimesheetEntries([
      {
        id: "entry1",
        date: "2025-05-01",
        workStart: "09:00",
        workEnd: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
        otStart: "",
        otEnd: "",
        description: "Regular work day",
        remarks: "",
        totalHours: 7,
        status: "pending"
      }
    ]);
    setTimesheetStatus("pending");
  };
  
  // Handlers for timesheet approval/rejection
  const handleApproveTimesheet = () => {
    setTimesheetStatus("approved");
  };
  
  const handleRejectTimesheet = () => {
    setTimesheetStatus("rejected");
  };
  
  // Handler for going back to dashboard
  const handleBack = () => {
    setSelectedEmployee(undefined);
    setActiveTab("dashboard");
  };
  
  // Mock function for PDF generation
  const handleGeneratePDF = () => {
    console.log("Generating PDF...");
    // Implementation would go here in a real app
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 sm:grid-cols-5 md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-6 grid-cols-1">
              <TimesheetAnalytics employees={employees} />
              <PendingTimesheetsTable 
                employees={employees} 
                onSelectEmployee={handleSelectEmployee} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="employees">
            <h1 className="text-3xl font-bold mb-6">Employee Management</h1>
            <EmployeeManagement employees={employees} />
          </TabsContent>
          
          <TabsContent value="timesheets">
            <h1 className="text-3xl font-bold mb-6">Timesheet Review</h1>
            {selectedEmployee ? (
              <TimesheetReview
                employee={selectedEmployee}
                entries={timesheetEntries}
                timesheetStatus={timesheetStatus}
                onBack={handleBack}
                onApprove={handleApproveTimesheet}
                onReject={handleRejectTimesheet}
                onGeneratePDF={handleGeneratePDF}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 py-4">Select an employee from the dashboard to review their timesheet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 py-4">Reports functionality coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leaves">
            <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
            <LeaveApplicationsReview />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
