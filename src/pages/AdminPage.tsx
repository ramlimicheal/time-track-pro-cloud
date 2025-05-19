
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Printer } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";

const AdminPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [timesheetStatus, setTimesheetStatus] = useState<"pending" | "approved" | "rejected">("pending");
  
  // Mock employee data
  const employees = [
    { id: "1", name: "John Employee", department: "Engineering", pendingTimesheets: 1 },
    { id: "2", name: "Jane Smith", department: "Marketing", pendingTimesheets: 0 },
    { id: "3", name: "Robert Johnson", department: "Finance", pendingTimesheets: 2 },
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

  // Calculate total hours
  const totalHours = mockEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
  
  // Function to directly trigger printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl print:m-0 print:p-0 print:max-w-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        {!selectedEmployee ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Pending Timesheets</h2>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>May 2025</TableCell>
                    <TableCell>
                      {employee.pendingTimesheets > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          No Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEmployee(employee.id)}
                        disabled={employee.pendingTimesheets === 0}
                      >
                        <Calendar className="mr-1 h-4 w-4" />
                        View Timesheet
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 print:hidden">
              <Button
                variant="outline"
                onClick={() => setSelectedEmployee(null)}
              >
                Back to Dashboard
              </Button>
              
              {timesheetStatus === "approved" && (
                <Button 
                  onClick={handlePrint} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Timesheet
                </Button>
              )}
            </div>
            
            <div className="mb-4 print:hidden">
              <h2 className="text-xl font-semibold mb-2">
                {employees.find((e) => e.id === selectedEmployee)?.name} - May 2025 Timesheet
              </h2>
              <p className="text-gray-600">
                Department: {employees.find((e) => e.id === selectedEmployee)?.department}
              </p>
            </div>
            
            <TimesheetTable
              month="May"
              year={2025}
              entries={mockEntries}
              readOnly={true}
              timesheetStatus={timesheetStatus}
            />
            
            <div className="mt-6 flex gap-4 justify-end print:hidden">
              <Button variant="outline" onClick={handleReject}>
                Reject with Comments
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Approve Timesheet
              </Button>
            </div>

            {/* Enhanced print layout - only visible when printing */}
            <div className="hidden print:block">
              <div className="print-header">
                <div className="print-header-logo">TimeTrack Pro</div>
                <div className="print-header-info">
                  <p>123 Business Ave., Corporate Plaza, Suite 200</p>
                  <p>contact@timetrackpro.com | (555) 123-4567</p>
                </div>
              </div>

              <div className="timesheet-title">
                Employee Timesheet Report
              </div>

              <div className="employee-info">
                <div className="employee-info-section">
                  <p><span className="info-label">Employee:</span> {employees.find((e) => e.id === selectedEmployee)?.name}</p>
                  <p><span className="info-label">Department:</span> {employees.find((e) => e.id === selectedEmployee)?.department}</p>
                  <p><span className="info-label">Employee ID:</span> {selectedEmployee}</p>
                </div>
                <div className="employee-info-section">
                  <p><span className="info-label">Period:</span> May 2025</p>
                  <p><span className="info-label">Status:</span> {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}</p>
                  <p><span className="info-label">Total Hours:</span> {totalHours.toFixed(2)}</p>
                </div>
              </div>

              {/* TimesheetTable is automatically displayed between these sections */}

              <div className="signature-section">
                <div className="signature-column">
                  <div className="signature-box">
                    Employee Signature
                  </div>
                  <div className="signature-box">
                    Date
                  </div>
                </div>
                <div className="signature-column">
                  <div className="signature-box">
                    Manager Approval
                  </div>
                  <div className="signature-box">
                    Date
                  </div>
                </div>
              </div>

              <div className="print-footer">
                <div>TimeTrack Pro - Employee Timesheet Management System</div>
                <div>Printed on {new Date().toLocaleDateString()} | Page <span className="page-number"></span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
