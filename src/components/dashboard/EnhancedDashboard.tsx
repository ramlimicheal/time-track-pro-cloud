
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  CheckCircle,
  Calendar,
  Target,
  Award,
  Plus,
  FileText
} from "lucide-react";
import { CleanAdminDashboard } from "./CleanAdminDashboard";
import { QuickActions } from "./QuickActions";

interface EnhancedDashboardProps {
  userRole: "admin" | "employee";
}

export const EnhancedDashboard = ({ userRole }: EnhancedDashboardProps) => {
  const [employeeData, setEmployeeData] = useState({
    myProductivity: 92.3,
    myHoursToday: 7.5,
    myTasksCompleted: 8,
    myTeamRating: 4.8,
    pendingApprovals: 2,
    submittedTimesheets: 5
  });

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Load employees for admin dashboard
    if (userRole === "admin") {
      const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
      setEmployees(storedEmployees);
    }

    // Simulate real-time data updates for employee view
    if (userRole === "employee") {
      const interval = setInterval(() => {
        setEmployeeData(prev => ({
          ...prev,
          myProductivity: Math.max(80, Math.min(100, prev.myProductivity + (Math.random() - 0.5))),
          myHoursToday: Math.max(6, Math.min(10, prev.myHoursToday + (Math.random() - 0.5) * 0.5)),
        }));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Admin dashboard
  if (userRole === "admin") {
    return <CleanAdminDashboard employees={employees} />;
  }

  // Employee dashboard
  const employeeMetrics = [
    {
      title: "Today's Hours",
      value: `${employeeData.myHoursToday.toFixed(1)}h`,
      description: "Hours worked today",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Productivity",
      value: `${employeeData.myProductivity.toFixed(1)}%`,
      description: "This week's performance",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Tasks Done",
      value: employeeData.myTasksCompleted.toString(),
      description: "Completed today",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Team Rating",
      value: `${employeeData.myTeamRating}/5`,
      description: "Current team rating",
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Employee Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employeeMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-full`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-600">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Quick Actions and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickActions employeeId="current-user" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              My Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Approvals</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {employeeData.pendingApprovals}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Submitted Timesheets</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {employeeData.submittedTimesheets}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm text-gray-600">May 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
