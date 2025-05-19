
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
import { Calendar } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";

const AdminPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
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
    toast.success("Timesheet approved successfully");
    setSelectedEmployee(null);
  };

  const handleReject = () => {
    toast.success("Timesheet rejected with comments");
    setSelectedEmployee(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
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
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setSelectedEmployee(null)}
            >
              Back to Dashboard
            </Button>
            
            <div className="mb-4">
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
            />
            
            <div className="mt-6 flex gap-4 justify-end">
              <Button variant="outline" onClick={handleReject}>
                Reject with Comments
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Approve Timesheet
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
