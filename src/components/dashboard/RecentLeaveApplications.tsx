
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface LeaveApplication {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface RecentLeaveApplicationsProps {
  employeeId: string;
}

export const RecentLeaveApplications = ({ employeeId }: RecentLeaveApplicationsProps) => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    // In a real app, this would be fetched from an API
    const storedApplications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    const employeeApplications = storedApplications.filter(
      (app: LeaveApplication) => app.employeeId === employeeId
    );
    
    setApplications(employeeApplications);
  }, [employeeId]);

  // Format date range to display
  const formatDateRange = (start: string, end: string) => {
    const startDate = format(new Date(start), "dd MMM yyyy");
    const endDate = format(new Date(end), "dd MMM yyyy");
    return `${startDate} - ${endDate}`;
  };

  // Calculate number of days between two dates
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because inclusive
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Recent Leave Applications</h2>
      
      {applications.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          You haven't submitted any leave applications yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Range</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  {formatDateRange(application.startDate, application.endDate)}
                </TableCell>
                <TableCell>
                  {calculateDays(application.startDate, application.endDate)}
                </TableCell>
                <TableCell className="capitalize">{application.leaveType}</TableCell>
                <TableCell>
                  <StatusBadge status={application.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

// Helper component to display status badge with appropriate color
const StatusBadge = ({ status }: { status: "pending" | "approved" | "rejected" }) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    approved: { color: "bg-green-100 text-green-800", label: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" }
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};
