
import { TimesheetEntry } from "@/types";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface PrintableTimesheetReportProps {
  employee: Employee | undefined;
  entries: TimesheetEntry[];
  timesheetStatus: "draft" | "pending" | "approved" | "rejected";
  selectedEmployee: string | null;
}

export const PrintableTimesheetReport = ({
  employee,
  entries,
  timesheetStatus,
  selectedEmployee,
}: PrintableTimesheetReportProps) => {
  // Calculate total hours
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  
  // Format status with capitalized first letter
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <div className="hidden print:block p-8">
      <div className="print-header mb-8 border-b pb-4 flex justify-between items-center">
        <div className="print-header-logo text-2xl font-bold">TimeTrack Pro</div>
        <div className="print-header-info text-right">
          <p>123 Business Ave., Corporate Plaza, Suite 200</p>
          <p>contact@timetrackpro.com | (555) 123-4567</p>
        </div>
      </div>

      <div className="timesheet-title text-2xl font-bold text-center mb-6">
        Employee Timesheet Report
      </div>

      <div className="employee-info flex justify-between mb-8">
        <div className="employee-info-section">
          <p><span className="font-semibold">Employee:</span> {employee?.name}</p>
          <p><span className="font-semibold">Department:</span> {employee?.department}</p>
          <p><span className="font-semibold">Employee ID:</span> {selectedEmployee}</p>
        </div>
        <div className="employee-info-section text-right">
          <p><span className="font-semibold">Period:</span> May 2025</p>
          <p><span className="font-semibold">Status:</span> {formatStatus(timesheetStatus)}</p>
          <p><span className="font-semibold">Total Hours:</span> {totalHours.toFixed(2)}</p>
        </div>
      </div>

      {/* Data only report - no screenshots */}
      <div className="timesheet-data mb-8">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="border">Date</TableHead>
              <TableHead className="border">Start</TableHead>
              <TableHead className="border">End</TableHead>
              <TableHead className="border">Break</TableHead>
              <TableHead className="border">Hours</TableHead>
              <TableHead className="border">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="border">{entry.date}</TableCell>
                <TableCell className="border">{entry.workStart}</TableCell>
                <TableCell className="border">{entry.workEnd}</TableCell>
                <TableCell className="border">{entry.breakStart && entry.breakEnd ? `${entry.breakStart} - ${entry.breakEnd}` : 'None'}</TableCell>
                <TableCell className="border">{entry.totalHours.toFixed(2)}</TableCell>
                <TableCell className="border">{formatStatus(entry.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="signature-section flex justify-between mb-12 mt-16">
        <div className="signature-column w-[45%]">
          <div className="border-b border-black pb-1 mb-2">
            Employee Signature
          </div>
          <div className="border-b border-black pb-1">
            Date
          </div>
        </div>
        <div className="signature-column w-[45%]">
          <div className="border-b border-black pb-1 mb-2">
            Manager Approval
          </div>
          <div className="border-b border-black pb-1">
            Date
          </div>
        </div>
      </div>

      <div className="print-footer text-sm text-gray-600 border-t pt-4 flex justify-between">
        <div>TimeTrack Pro - Employee Timesheet Management System</div>
        <div>Printed on {new Date().toLocaleDateString()} | Page <span className="page-number"></span></div>
      </div>
    </div>
  );
};
