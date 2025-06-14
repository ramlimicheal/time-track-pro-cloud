
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Calendar, Clock, Users } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { LeaveApplication, Employee } from "@/types";

export const LeaveManagementDashboard = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDaysRequested: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedApplications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    
    const enrichedApplications = storedApplications.map((app: any) => {
      const employee = storedEmployees.find((e: any) => e.id === app.employeeId);
      return {
        ...app,
        employeeName: employee?.name || "Unknown Employee",
        status: ["pending", "approved", "rejected"].includes(app.status) ? app.status : "pending"
      } as LeaveApplication;
    });
    
    setApplications(enrichedApplications);
    setEmployees(storedEmployees);
    
    // Calculate stats
    const pending = enrichedApplications.filter(app => app.status === "pending").length;
    const approved = enrichedApplications.filter(app => app.status === "approved").length;
    const rejected = enrichedApplications.filter(app => app.status === "rejected").length;
    const totalDaysRequested = enrichedApplications.reduce((total, app) => {
      return total + (differenceInDays(new Date(app.endDate), new Date(app.startDate)) + 1);
    }, 0);
    
    setStats({ pending, approved, rejected, totalDaysRequested });
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
    
    // Update stats
    const pending = updatedApplications.filter(app => app.status === "pending").length;
    const approvedCount = updatedApplications.filter(app => app.status === "approved").length;
    const rejected = updatedApplications.filter(app => app.status === "rejected").length;
    
    setStats(prev => ({ ...prev, pending, approved: approvedCount, rejected }));
    
    toast.success(`Leave application ${approved ? "approved" : "rejected"} successfully`);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = format(new Date(start), "dd MMM yyyy");
    const endDate = format(new Date(end), "dd MMM yyyy");
    return `${startDate} - ${endDate}`;
  };

  const calculateDays = (start: string, end: string) => {
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  const pendingApplications = applications.filter(app => app.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leave Management Dashboard</h2>
        <Button 
          variant="outline" 
          onClick={loadData}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Refresh Data
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDaysRequested}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending leave applications to review
            </div>
          ) : (
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
                          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                          onClick={() => handleApproval(application.id, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
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
          )}
        </CardContent>
      </Card>
      
      {/* All Applications History */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
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
                    <TableCell>
                      <StatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.createdAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

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
