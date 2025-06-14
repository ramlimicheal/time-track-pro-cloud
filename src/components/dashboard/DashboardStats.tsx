
import { useEffect, useState } from "react";
import { Employee, Timesheet, LeaveApplication } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileX } from "lucide-react";
import { dataSyncManager } from "@/utils/dataSync";
import { differenceInDays } from "date-fns";

interface DashboardStatsProps {
  employee: Employee;
}

interface EmployeeStats {
  totalHours: number;
  pendingTimesheets: number;
  pendingLeave: number;
  productivity: number;
  leaveBalance: number;
}

export const DashboardStats = ({ employee }: DashboardStatsProps) => {
  const [stats, setStats] = useState<EmployeeStats>({
    totalHours: 0,
    pendingTimesheets: 0,
    pendingLeave: 0,
    productivity: 0,
    leaveBalance: 21
  });

  useEffect(() => {
    const loadStats = () => {
      // Get timesheet data
      const keys = Object.keys(localStorage).filter(key => key.startsWith('timesheet-'));
      let totalHours = 0;
      let pendingTimesheets = 0;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      keys.forEach(key => {
        try {
          const timesheet = JSON.parse(localStorage.getItem(key) || '{}') as Timesheet;
          if (timesheet.employeeId === employee.id && 
              timesheet.month === currentMonth && 
              timesheet.year === currentYear) {
            if (timesheet.status === 'pending') pendingTimesheets++;
            timesheet.entries?.forEach(entry => {
              totalHours += entry.totalHours || 0;
            });
          }
        } catch (e) {
          console.error("Error parsing timesheet:", e);
        }
      });

      // Get leave data
      const applications = JSON.parse(localStorage.getItem("leaveApplications") || "[]") as LeaveApplication[];
      const employeeApplications = applications.filter(app => app.employeeId === employee.id);
      const pendingLeave = employeeApplications.filter(app => app.status === "pending").length;
      
      // Calculate used leave days this year
      const currentYearApplications = employeeApplications.filter(app => {
        const appDate = new Date(app.startDate);
        return appDate.getFullYear() === currentYear && app.status === "approved";
      });
      
      const usedLeaveDays = currentYearApplications.reduce((total, app) => {
        return total + differenceInDays(new Date(app.endDate), new Date(app.startDate)) + 1;
      }, 0);
      
      const leaveBalance = Math.max(0, 21 - usedLeaveDays); // Assuming 21 days annual leave
      const productivity = totalHours > 0 ? Math.min(100, (totalHours / 160) * 100) : 0; // Based on ~160 hours/month

      setStats({
        totalHours,
        pendingTimesheets,
        pendingLeave,
        productivity,
        leaveBalance
      });
    };

    loadStats();

    // Subscribe to data changes
    const handleDataUpdate = () => loadStats();
    dataSyncManager.subscribe("timesheet-submitted", handleDataUpdate);
    dataSyncManager.subscribe("timesheet-approved", handleDataUpdate);
    dataSyncManager.subscribe("leave-submitted", handleDataUpdate);
    dataSyncManager.subscribe("leave-status-updated", handleDataUpdate);

    // Listen for storage changes from other tabs
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      dataSyncManager.unsubscribe("timesheet-submitted", handleDataUpdate);
      dataSyncManager.unsubscribe("timesheet-approved", handleDataUpdate);
      dataSyncManager.unsubscribe("leave-submitted", handleDataUpdate);
      dataSyncManager.unsubscribe("leave-status-updated", handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employee.id]);

  // Get status info based on timesheet status
  const getTimesheetStatusInfo = () => {
    if (stats.pendingTimesheets > 0) {
      return {
        value: stats.pendingTimesheets.toString(),
        change: "Awaiting approval",
        color: "text-yellow-500",
        bgColor: "bg-yellow-100"
      };
    }
    
    return {
      value: "0",
      change: "All approved",
      color: "text-green-500",
      bgColor: "bg-green-100"
    };
  };
  
  const timesheetStatus = getTimesheetStatusInfo();
  
  const dashboardStats = [
    {
      title: "Hours this month",
      value: `${stats.totalHours.toFixed(1)}h`,
      change: stats.totalHours > 120 ? "Above target" : stats.totalHours > 80 ? "On track" : "Below target",
      icon: Clock,
      color: stats.totalHours > 120 ? "text-green-500" : stats.totalHours > 80 ? "text-blue-500" : "text-orange-500",
      bgColor: stats.totalHours > 120 ? "bg-green-100" : stats.totalHours > 80 ? "bg-blue-100" : "bg-orange-100"
    },
    {
      title: "Timesheet Status",
      value: timesheetStatus.value,
      change: timesheetStatus.change,
      icon: FileCheck,
      color: timesheetStatus.color,
      bgColor: timesheetStatus.bgColor
    },
    {
      title: "Leave Balance",
      value: stats.leaveBalance.toString(),
      change: "Days remaining",
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pending Applications",
      value: stats.pendingLeave.toString(),
      change: stats.pendingLeave > 0 ? "Awaiting approval" : "All processed",
      icon: FileX,
      color: stats.pendingLeave > 0 ? "text-orange-500" : "text-green-500",
      bgColor: stats.pendingLeave > 0 ? "bg-orange-100" : "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {dashboardStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-full`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
