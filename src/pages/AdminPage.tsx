import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { TimesheetAnalytics } from "@/components/admin/TimesheetAnalytics";
import { PendingTimesheetsTable } from "@/components/admin/PendingTimesheetsTable";
import { LeaveApplicationsReview } from "@/components/admin/LeaveApplicationsReview";
import { ReportsSection } from "@/components/admin/ReportsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, TimesheetEntry, Timesheet } from "@/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [timesheetStatus, setTimesheetStatus] = useState<"draft" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const navigate = useNavigate();
  
  // Load employee data from localStorage and check if setup is needed
  useEffect(() => {
    loadEmployeeData();
    checkIfSetupNeeded();
  }, []);
  
  const loadEmployeeData = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
  };
  
  // Check if this is first-time setup
  const checkIfSetupNeeded = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    
    if (user.id === "setup-admin" && admins.length === 0) {
      setShowSetupDialog(true);
    }
  };
  
  // Handle admin account creation
  const handleCreateAdmin = () => {
    if (!adminUsername || !adminPassword || !adminName || !adminEmail) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const newAdmin = {
      id: `adm-${Date.now()}`,
      username: adminUsername,
      password: adminPassword,
      name: adminName,
      email: adminEmail
    };
    
    // Save admin to localStorage
    const admins = [newAdmin];
    localStorage.setItem("admins", JSON.stringify(admins));
    
    // Update user in localStorage
    const user = {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: "manager"
    };
    localStorage.setItem("user", JSON.stringify(user));
    
    setShowSetupDialog(false);
    toast.success("Admin account created successfully");
  };
  
  // Handler for selecting an employee to review timesheet
  const handleSelectEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    
    // Set the active tab to "timesheets"
    setActiveTab("timesheets");
    
    // Look for actual timesheet data in localStorage
    const timesheets = findTimesheetsForEmployee(employeeId);
    if (timesheets.length > 0) {
      const latestTimesheet = timesheets[0]; // Assuming the first one is the most recent
      setTimesheetEntries(latestTimesheet.entries);
      setTimesheetStatus(latestTimesheet.status);
    } else {
      // Fallback to mock data if no actual timesheet exists
      setTimesheetEntries([
        {
          id: "entry1",
          date: "01-May-2025",
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
    }
  };
  
  // Find all timesheets for a specific employee
  const findTimesheetsForEmployee = (employeeId: string): Timesheet[] => {
    const keys = Object.keys(localStorage);
    const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
    
    const timesheets: Timesheet[] = [];
    
    timesheetKeys.forEach(key => {
      try {
        const timesheet = JSON.parse(localStorage.getItem(key) || '{}') as Timesheet;
        if (timesheet.employeeId === employeeId) {
          timesheets.push(timesheet);
        }
      } catch (e) {
        console.error("Error parsing timesheet:", e);
      }
    });
    
    // Sort by most recent (assuming higher month/year is more recent)
    return timesheets.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  };
  
  // Handlers for timesheet approval/rejection
  const handleApproveTimesheet = () => {
    if (!selectedEmployee) return;
    
    updateTimesheetStatus("approved");
    
    // Update employee's pending timesheet count
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return { ...emp, pendingTimesheets: 0 };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    
    // Send notification to employee
    sendNotificationToEmployee(selectedEmployee.id, "Timesheet Approved", 
      `Your timesheet for May 2025 has been approved.`);
    
    // Show success notification to admin
    toast.success(`Timesheet for ${selectedEmployee.name} approved successfully`);
  };
  
  const handleRejectTimesheet = () => {
    if (!selectedEmployee) return;
    
    updateTimesheetStatus("rejected");
    
    // Update employee's pending timesheet count
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return { ...emp, pendingTimesheets: 0 };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    
    // Send notification to employee
    sendNotificationToEmployee(selectedEmployee.id, "Timesheet Rejected", 
      `Your timesheet for May 2025 has been rejected. Please contact your manager.`);
    
    // Show notification to admin
    toast.error(`Timesheet for ${selectedEmployee.name} rejected`);
  };
  
  // Function to send notification to employee
  const sendNotificationToEmployee = (employeeId: string, title: string, message: string) => {
    // Get existing notifications or initialize empty array
    const notifications = JSON.parse(localStorage.getItem(`notifications-${employeeId}`) || "[]");
    
    // Add new notification
    notifications.unshift({
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    // Save back to localStorage
    localStorage.setItem(`notifications-${employeeId}`, JSON.stringify(notifications));
    
    console.log(`Notification sent to employee ${employeeId}: ${title}`);
  };
  
  // Update timesheet status in localStorage
  const updateTimesheetStatus = (status: "approved" | "rejected") => {
    if (!selectedEmployee) return;
    
    const timesheets = findTimesheetsForEmployee(selectedEmployee.id);
    if (timesheets.length === 0) return;
    
    const latestTimesheet = timesheets[0];
    
    // Update status
    latestTimesheet.status = status;
    latestTimesheet.entries = latestTimesheet.entries.map(entry => ({
      ...entry,
      status: status
    }));
    
    // Save back to localStorage
    const key = `timesheet-${getMonthName(latestTimesheet.month)}-${latestTimesheet.year}`;
    localStorage.setItem(key, JSON.stringify(latestTimesheet));
    
    // Update local state
    setTimesheetStatus(status);
    setTimesheetEntries(latestTimesheet.entries);
  };
  
  const getMonthName = (monthNumber: number): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[monthNumber - 1] || "Unknown";
  };
  
  // Handler for going back to dashboard
  const handleBack = () => {
    setSelectedEmployee(undefined);
    setActiveTab("dashboard");
    // Reload data to see any changes
    loadEmployeeData();
  };
  
  // Mock function for PDF generation
  const handleGeneratePDF = () => {
    console.log("Generating PDF...");
    window.print();
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If user is not authorized, redirect to login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== "manager") {
      navigate("/");
      toast.error("You don't have permission to access this page");
    }
  }, [navigate]);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 sm:grid-cols-5 md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {employees.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center py-10">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-medium mb-2">No employees yet</h2>
                  <p className="text-gray-500 mb-6">Add employees to get started with the system</p>
                  <Button onClick={() => setActiveTab("employees")}>
                    Add Your First Employee
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1">
                <TimesheetAnalytics employees={employees} />
                <PendingTimesheetsTable 
                  employees={employees} 
                  onSelectEmployee={handleSelectEmployee} 
                />
              </div>
            )}
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
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Select an employee to review their timesheet</h2>
                  {employees.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No employees found in the system</p>
                      <Button onClick={() => setActiveTab("employees")}>
                        Add Your First Employee
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employees by name or department"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select onValueChange={(value) => value && handleSelectEmployee(value)}>
                        <SelectTrigger className="w-full sm:w-60">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {employees.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium">Employees with pending timesheets</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {filteredEmployees.filter(emp => emp.pendingTimesheets > 0).length > 0 ? (
                        filteredEmployees
                          .filter(emp => emp.pendingTimesheets > 0)
                          .map(emp => (
                            <div key={emp.id} className="px-6 py-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{emp.name}</p>
                                <p className="text-sm text-gray-500">{emp.department}</p>
                              </div>
                              <Button 
                                variant="outline" 
                                onClick={() => handleSelectEmployee(emp.id)}
                                className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                Review Timesheet
                              </Button>
                            </div>
                          ))
                      ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                          No pending timesheets found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <ReportsSection employees={employees} />
          </TabsContent>
          
          <TabsContent value="leaves">
            <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
            <LeaveApplicationsReview />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Admin Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>
              Set up your first administrator account to get started with the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="admin-name" className="text-sm font-medium">Full Name</label>
              <Input 
                id="admin-name" 
                value={adminName} 
                onChange={(e) => setAdminName(e.target.value)} 
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">Email</label>
              <Input 
                id="admin-email" 
                type="email" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-sm font-medium">Username</label>
              <Input 
                id="admin-username" 
                value={adminUsername} 
                onChange={(e) => setAdminUsername(e.target.value)} 
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">Password</label>
              <Input 
                id="admin-password" 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCreateAdmin}>
              Create Admin Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminPage;
