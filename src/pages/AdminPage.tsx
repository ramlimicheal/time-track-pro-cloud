
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimesheetEntry, Employee } from "@/types";
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
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  
  // Mock employee data - expanded with more fields
  const employees: Employee[] = [
    { 
      id: "1", 
      name: "John Employee", 
      department: "Engineering", 
      pendingTimesheets: 1,
      email: "john@example.com",
      position: "Software Engineer",
      joinDate: "2023-01-15",
      status: "active",
      dob: "1990-05-15",
      bloodGroup: "O+",
      passportNumber: "A1234567",
      phoneNumber: "+91 9876543210",
      indianAddress: "123 Main St, Delhi, India",
      omanAddress: "456 Oman St, Muscat, Oman",
      emergencyPhoneNumber: "+91 9876543211",
      username: "john.emp1234",
      password: "securePass123"
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      department: "Marketing", 
      pendingTimesheets: 0,
      email: "jane@example.com",
      position: "Marketing Specialist",
      joinDate: "2022-06-10",
      status: "active",
      dob: "1992-03-21",
      bloodGroup: "A+",
      passportNumber: "B7654321",
      phoneNumber: "+91 9876543212",
      indianAddress: "789 Other St, Mumbai, India",
      omanAddress: "101 Other St, Salalah, Oman",
      emergencyPhoneNumber: "+91 9876543213",
      username: "jane.smi5678",
      password: "securePwd456"
    },
    { 
      id: "3", 
      name: "Robert Johnson", 
      department: "Finance", 
      pendingTimesheets: 2,
      email: "robert@example.com",
      position: "Financial Analyst",
      joinDate: "2021-11-22",
      status: "active",
      dob: "1985-08-11",
      bloodGroup: "B-",
      passportNumber: "C9876543",
      phoneNumber: "+91 9876543214",
      indianAddress: "456 Finance St, Bangalore, India",
      omanAddress: "789 Finance St, Sohar, Oman",
      emergencyPhoneNumber: "+91 9876543215",
      username: "robert.joh9012",
      password: "secureKey789"
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

  useEffect(() => {
    if (selectedEmployee) {
      setEntries(mockEntries);
    }
  }, [selectedEmployee]);

  const handleApprove = () => {
    // Update all entries to approved status
    const updatedEntries = entries.map(entry => ({
      ...entry,
      status: "approved" as const
    }));
    
    setEntries(updatedEntries);
    setTimesheetStatus("approved");
    
    // Update the employee's pending timesheet count
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee) {
        return {
          ...emp,
          pendingTimesheets: 0
        };
      }
      return emp;
    });
    
    toast.success("Timesheet approved successfully");
  };

  const handleReject = () => {
    // Update all entries to rejected status
    const updatedEntries = entries.map(entry => ({
      ...entry,
      status: "rejected" as const
    }));
    
    setEntries(updatedEntries);
    setTimesheetStatus("rejected");
    toast.error("Timesheet rejected with comments");
  };
  
  // Function to go back to dashboard and reset status
  const handleBack = () => {
    setSelectedEmployee(null);
    setTimesheetStatus("pending");
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
              employee={employees.find(e => e.id === selectedEmployee)}
              entries={entries}
              timesheetStatus={timesheetStatus}
              onBack={handleBack}
              onApprove={handleApprove}
              onReject={handleReject}
              onGeneratePDF={generatePDF}
            />

            <PrintableTimesheetReport
              employee={employees.find(e => e.id === selectedEmployee)}
              entries={entries}
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
