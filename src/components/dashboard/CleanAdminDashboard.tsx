
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  TrendingUp
} from "lucide-react";
import { dataSyncManager } from "@/utils/dataSync";
import { Employee, Timesheet, LeaveApplication } from "@/types";
import { toast } from "sonner";

interface CleanAdminDashboardProps {
  employees: Employee[];
}

export const CleanAdminDashboard = ({ employees }: CleanAdminDashboardProps) => {
  const [dashboardData, setDashboardData] = useState({
    pendingTimesheets: 0,
    pendingLeave: 0,
    recentSubmissions: [],
    totalEmployees: 0
  });
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const handleTimesheetUpdate = () => loadDashboardData();
    const handleLeaveUpdate = () => loadDashboardData();
    
    dataSyncManager.subscribe("timesheet-submitted", handleTimesheetUpdate);
    dataSyncManager.subscribe("timesheet-approved", handleTimesheetUpdate);
    dataSyncManager.subscribe("timesheet-rejected", handleTimesheetUpdate);
    dataSyncManager.subscribe("leave-submitted", handleLeaveUpdate);
    dataSyncManager.subscribe("leave-status-updated", handleLeaveUpdate);
    
    return () => {
      dataSyncManager.unsubscribe("timesheet-submitted", handleTimesheetUpdate);
      dataSyncManager.unsubscribe("timesheet-approved", handleTimesheetUpdate);
      dataSyncManager.unsubscribe("timesheet-rejected", handleTimesheetUpdate);
      dataSyncManager.unsubscribe("leave-submitted", handleLeaveUpdate);
      dataSyncManager.unsubscribe("leave-status-updated", handleLeaveUpdate);
    };
  }, []);

  const loadDashboardData = () => {
    const data = dataSyncManager.getDashboardData();
    setDashboardData(data);
    
    // Load pending items for quick actions
    const allTimesheets = dataSyncManager.getAllTimesheets();
    const pending = allTimesheets.filter(t => t.status === 'pending');
    setPendingTimesheets(pending);
    
    const applications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    const pendingApps = applications.filter((app: LeaveApplication) => app.status === 'pending');
    setPendingLeave(pendingApps);
  };

  const handleApproveTimesheet = (timesheetId: string, employeeId: string) => {
    dataSyncManager.approveTimesheet(timesheetId, employeeId);
    const employee = employees.find(e => e.id === employeeId);
    toast.success(`Timesheet approved for ${employee?.name}`);
  };

  const handleRejectTimesheet = (timesheetId: string, employeeId: string) => {
    dataSyncManager.rejectTimesheet(timesheetId, employeeId);
    const employee = employees.find(e => e.id === employeeId);
    toast.error(`Timesheet rejected for ${employee?.name}`);
  };

  const handleApproveLeave = (applicationId: string) => {
    dataSyncManager.updateLeaveStatus(applicationId, "approved");
    const application = pendingLeave.find(app => app.id === applicationId);
    const employee = employees.find(e => e.id === application?.employeeId);
    toast.success(`Leave approved for ${employee?.name}`);
  };

  const handleRejectLeave = (applicationId: string) => {
    dataSyncManager.updateLeaveStatus(applicationId, "rejected");
    const application = pendingLeave.find(app => app.id === applicationId);
    const employee = employees.find(e => e.id === application?.employeeId);
    toast.error(`Leave rejected for ${employee?.name}`);
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown Employee';
  };

  return (
    <div className="space-y-4">
      {/* Essential Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Pending Timesheets</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.pendingTimesheets}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Pending Leave</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.pendingLeave}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Employees</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Active Tasks</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.pendingTimesheets + dashboardData.pendingLeave}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Timesheets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Timesheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTimesheets.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending timesheets</p>
            ) : (
              <div className="space-y-2">
                {pendingTimesheets.slice(0, 3).map((timesheet) => (
                  <div key={timesheet.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{getEmployeeName(timesheet.employeeId)}</p>
                      <p className="text-xs text-gray-500">Month: {timesheet.month + 1}/{timesheet.year}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={() => handleApproveTimesheet(timesheet.id, timesheet.employeeId)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={() => handleRejectTimesheet(timesheet.id, timesheet.employeeId)}
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingTimesheets.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{pendingTimesheets.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Leave Applications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Pending Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLeave.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending leave requests</p>
            ) : (
              <div className="space-y-2">
                {pendingLeave.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{getEmployeeName(application.employeeId)}</p>
                      <p className="text-xs text-gray-500">{application.leaveType} • {new Date(application.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={() => handleApproveLeave(application.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={() => handleRejectLeave(application.id)}
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingLeave.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{pendingLeave.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Employee Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboardData.recentSubmissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              dashboardData.recentSubmissions.map((submission: any, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-l-4 border-blue-200 bg-blue-50">
                  <div>
                    <p className="font-medium text-sm">{submission.employeeName}</p>
                    <p className="text-xs text-gray-600">
                      Submitted {submission.type} • {new Date(submission.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
