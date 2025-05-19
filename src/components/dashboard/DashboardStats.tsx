
import { useEffect, useState } from "react";
import { Employee, Timesheet } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileX } from "lucide-react";

interface DashboardStatsProps {
  employee: Employee;
}

export const DashboardStats = ({ employee }: DashboardStatsProps) => {
  const [latestTimesheet, setLatestTimesheet] = useState<Timesheet | null>(null);
  
  // Find the latest timesheet for this employee
  useEffect(() => {
    const findLatestTimesheet = () => {
      const keys = Object.keys(localStorage);
      const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
      
      let latest: Timesheet | null = null;
      let latestDate = new Date(0);
      
      timesheetKeys.forEach(key => {
        try {
          const timesheet = JSON.parse(localStorage.getItem(key) || '{}') as Timesheet;
          if (timesheet.employeeId === employee.id) {
            const timesheetDate = new Date(timesheet.year, timesheet.month - 1);
            if (timesheetDate > latestDate) {
              latestDate = timesheetDate;
              latest = timesheet;
            }
          }
        } catch (e) {
          console.error("Error parsing timesheet:", e);
        }
      });
      
      setLatestTimesheet(latest);
    };
    
    findLatestTimesheet();
    
    // Add event listener for storage changes
    const handleStorageChange = () => {
      findLatestTimesheet();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employee.id]);
  
  // Get stats based on timesheet status
  const getTimesheetStatusInfo = () => {
    if (!latestTimesheet) {
      return {
        value: "0",
        change: "No timesheets",
        color: "text-gray-500",
        bgColor: "bg-gray-100"
      };
    }
    
    switch(latestTimesheet.status) {
      case "approved":
        return {
          value: "0",
          change: "Timesheet approved",
          color: "text-green-500",
          bgColor: "bg-green-100"
        };
      case "rejected":
        return {
          value: "1",
          change: "Timesheet rejected",
          color: "text-red-500",
          bgColor: "bg-red-100"
        };
      case "pending":
        return {
          value: "1",
          change: "Awaiting approval",
          color: "text-yellow-500",
          bgColor: "bg-yellow-100"
        };
      case "draft":
        return {
          value: "1",
          change: "Draft - needs submission",
          color: "text-blue-500",
          bgColor: "bg-blue-100"
        };
      default:
        return {
          value: "0",
          change: "No timesheets",
          color: "text-gray-500",
          bgColor: "bg-gray-100"
        };
    }
  };
  
  const timesheetStatus = getTimesheetStatusInfo();
  
  // In a real app, these values would come from the API
  const stats = [
    {
      title: "Hours this month",
      value: "145.5",
      change: "+12.5%",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-100"
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
      value: "14",
      change: "Days remaining",
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pending Applications",
      value: "2",
      change: "Awaiting approval",
      icon: FileX,
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
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
