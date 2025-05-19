
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee, Timesheet } from "@/types";
import { useState, useEffect } from "react";

export interface PendingTimesheetsTableProps {
  employees: Employee[];
  onSelectEmployee: (employeeId: string) => void;
}

export const PendingTimesheetsTable = ({ 
  employees,
  onSelectEmployee
}: PendingTimesheetsTableProps) => {
  const [employeeTimesheets, setEmployeeTimesheets] = useState<{[key: string]: Timesheet | null}>({});

  // Load timesheet data for all employees
  useEffect(() => {
    const timesheetData: {[key: string]: Timesheet | null} = {};
    
    employees.forEach(employee => {
      // Try to find the employee's timesheet
      const latestTimesheet = findLatestTimesheetForEmployee(employee.id);
      timesheetData[employee.id] = latestTimesheet;
    });
    
    setEmployeeTimesheets(timesheetData);
  }, [employees]);

  // Find the latest timesheet for an employee
  const findLatestTimesheetForEmployee = (employeeId: string): Timesheet | null => {
    const keys = Object.keys(localStorage);
    const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
    
    let latestTimesheet: Timesheet | null = null;
    let latestDate = new Date(0);
    
    timesheetKeys.forEach(key => {
      try {
        const timesheet = JSON.parse(localStorage.getItem(key) || '{}') as Timesheet;
        if (timesheet.employeeId === employeeId) {
          const timesheetDate = new Date(timesheet.year, timesheet.month - 1);
          if (timesheetDate > latestDate) {
            latestDate = timesheetDate;
            latestTimesheet = timesheet;
          }
        }
      } catch (e) {
        console.error("Error parsing timesheet:", e);
      }
    });
    
    return latestTimesheet;
  };

  // Get status display component based on timesheet status
  const getStatusDisplay = (employeeId: string) => {
    const timesheet = employeeTimesheets[employeeId];
    const hasPendingTimesheets = employees.find(e => e.id === employeeId)?.pendingTimesheets ?? 0;
    
    if (timesheet) {
      switch(timesheet.status) {
        case "approved":
          return (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Approved
            </span>
          );
        case "rejected":
          return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
              <X className="h-3 w-3 mr-1" />
              Rejected
            </span>
          );
        case "pending":
          return (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </span>
          );
        case "draft":
          return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
              Draft
            </span>
          );
      }
    } else if (hasPendingTimesheets > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          No Timesheet
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Timesheets</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Employee</TableHead>
              <TableHead className="font-medium">Department</TableHead>
              <TableHead className="font-medium">Period</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>May 2025</TableCell>
                  <TableCell>
                    {getStatusDisplay(employee.id)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectEmployee(employee.id)}
                      className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calendar className="mr-1 h-4 w-4" />
                      View Timesheet
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
