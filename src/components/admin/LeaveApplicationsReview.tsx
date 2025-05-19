
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { LeaveApplication } from "@/types";

export const LeaveApplicationsReview = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    loadLeaveApplications();
  }, []);
  
  const loadLeaveApplications = () => {
    // In a real app, this would be fetched from an API
    const storedApplications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    
    // Enrich with employee names from the employees data
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    
    const enrichedApplications = storedApplications.map((app: any) => {
      const employee = employees.find((e: any) => e.id === app.employeeId);
      return {
        ...app,
        employeeName: employee?.name || "Unknown Employee",
        // Ensure status is one of the allowed types
        status: ["pending", "approved", "rejected"].includes(app.status) ? app.status : "pending"
      } as LeaveApplication;
    });
    
    setApplications(enrichedApplications);
  };

  const handleApproval = (id: string, approved: boolean) => {
    const updatedApplications = applications.map(app => {
      if (app.id === id) {
        return { ...app, status: approved ? "approved" as const : "rejected" as const };
      }
      return app;
    });
    
    setApplications(updatedApplications);
    localStorage.setItem("leaveApplications", JSON.stringify(updatedApplications));
    
    toast.success(`Leave application ${approved ? "approved" : "rejected"} successfully`);
  };

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

  // Filter to get only pending applications
  const pendingApplications = applications.filter(app => app.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leave Applications</h2>
        <Button 
          variant="outline" 
          onClick={() => {
            // Clear all leave applications
            localStorage.setItem("leaveApplications", "[]");
            setApplications([]);
            toast.success("All leave application records cleared");
          }}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Clear All Records
        </Button>
      </div>
      
      {pendingApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No pending leave applications to review
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.employeeName}
                  </TableCell>
                  <TableCell>
                    {formatDateRange(application.startDate, application.endDate)}
                  </TableCell>
                  <TableCell>
                    {calculateDays(application.startDate, application.endDate)}
                  </TableCell>
                  <TableCell className="capitalize">{application.leaveType}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {application.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleApproval(application.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleApproval(application.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
