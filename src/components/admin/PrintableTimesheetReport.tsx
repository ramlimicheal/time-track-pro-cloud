
import { TimesheetEntry } from "@/types";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface PrintableTimesheetReportProps {
  employee: Employee | undefined;
  entries: TimesheetEntry[];
  timesheetStatus: "pending" | "approved" | "rejected";
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
  
  return (
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
          <p><span className="info-label">Employee:</span> {employee?.name}</p>
          <p><span className="info-label">Department:</span> {employee?.department}</p>
          <p><span className="info-label">Employee ID:</span> {selectedEmployee}</p>
        </div>
        <div className="employee-info-section">
          <p><span className="info-label">Period:</span> May 2025</p>
          <p><span className="info-label">Status:</span> {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}</p>
          <p><span className="info-label">Total Hours:</span> {totalHours.toFixed(2)}</p>
        </div>
      </div>

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
  );
};
