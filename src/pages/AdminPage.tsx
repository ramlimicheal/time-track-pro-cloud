
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";
import { PendingTimesheetsTable } from "@/components/admin/PendingTimesheetsTable";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { PrintableTimesheetReport } from "@/components/admin/PrintableTimesheetReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { TimesheetAnalytics } from "@/components/admin/TimesheetAnalytics";

const AdminPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [timesheetStatus, setTimesheetStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [activeTab, setActiveTab] = useState<string>("pending-timesheets");
  
  // Mock employee data - expanded with more fields
  const employees = [
    { 
      id: "1", 
      name: "John Employee", 
      department: "Engineering", 
      pendingTimesheets: 1,
      email: "john@example.com",
      position: "Software Engineer",
      joinDate: "2023-01-15",
      status: "active"
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      department: "Marketing", 
      pendingTimesheets: 0,
      email: "jane@example.com",
      position: "Marketing Specialist",
      joinDate: "2022-06-10",
      status: "active"
    },
    { 
      id: "3", 
      name: "Robert Johnson", 
      department: "Finance", 
      pendingTimesheets: 2,
      email: "robert@example.com",
      position: "Financial Analyst",
      joinDate: "2021-11-22",
      status: "active"
    },
  ];
  
  // Mock timesheet data
  const mockEntries: TimesheetEntry[] = [
    {
      id: "1",
      date: "01-May-2025",
      workStart: "09:00",
      workEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      otStart: "",
      otEnd: "",
      description: "Regular work day",
      remarks: "",
      totalHours: 7.0,
      status: "pending",
    },
    {
      id: "2",
      date: "02-May-2025",
      workStart: "09:00",
      workEnd: "18:00",
      breakStart: "12:30",
      breakEnd: "13:30",
      otStart: "18:00",
      otEnd: "19:00",
      description: "Project meeting",
      remarks: "Overtime requested",
      totalHours: 8.0,
      status: "pending",
    },
  ];

  const handleApprove = () => {
    setTimesheetStatus("approved");
    toast.success("Timesheet approved successfully");
  };

  const handleReject = () => {
    setTimesheetStatus("rejected");
    toast.success("Timesheet rejected with comments");
    setSelectedEmployee(null);
  };
  
  // Function to generate a clean PDF version
  const generatePDF = () => {
    // Add a class to the body for the PDF-specific styles
    document.body.classList.add('generating-pdf');
    
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      // Remove the class after printing
      document.body.classList.remove('generating-pdf');
    }, 100);
    
    toast.success("PDF generated successfully");
  };

  const currentEmployee = employees.find((e) => e.id === selectedEmployee);

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl print:m-0 print:p-0 print:max-w-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        {!selectedEmployee ? (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pending-timesheets">Pending Timesheets</TabsTrigger>
              <TabsTrigger value="employee-management">Employee Management</TabsTrigger>
              <TabsTrigger value="timesheet-analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending-timesheets">
              <PendingTimesheetsTable 
                employees={employees} 
                onSelectEmployee={setSelectedEmployee} 
              />
            </TabsContent>
            
            <TabsContent value="employee-management">
              <EmployeeManagement employees={employees} />
            </TabsContent>
            
            <TabsContent value="timesheet-analytics">
              <TimesheetAnalytics employees={employees} />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <TimesheetReview 
              employee={currentEmployee}
              entries={mockEntries}
              timesheetStatus={timesheetStatus}
              onBack={() => setSelectedEmployee(null)}
              onApprove={handleApprove}
              onReject={handleReject}
              onGeneratePDF={generatePDF}
            />

            <PrintableTimesheetReport
              employee={currentEmployee}
              entries={mockEntries}
              timesheetStatus={timesheetStatus}
              selectedEmployee={selectedEmployee}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
