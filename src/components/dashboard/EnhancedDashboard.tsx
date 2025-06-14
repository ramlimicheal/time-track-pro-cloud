
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Globe,
  Target,
  Award
} from "lucide-react";
import { WorkforceMap } from "./analytics/WorkforceMap";
import { RealtimeMetrics } from "./analytics/RealtimeMetrics";
import { ProjectStatus } from "./analytics/ProjectStatus";
import { PerformanceInsights } from "./analytics/PerformanceInsights";

interface EnhancedDashboardProps {
  userRole: "admin" | "employee";
}

export const EnhancedDashboard = ({ userRole }: EnhancedDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [realtimeData, setRealtimeData] = useState({
    activeEmployees: 145,
    ongoingProjects: 12,
    clientSatisfaction: 94.5,
    revenue: 125000,
    pendingApprovals: 8,
    myProductivity: 92.3,
    myHoursToday: 7.5,
    myTasksCompleted: 8,
    myTeamRating: 4.8
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        activeEmployees: prev.activeEmployees + Math.floor(Math.random() * 3) - 1,
        clientSatisfaction: Math.max(90, Math.min(100, prev.clientSatisfaction + (Math.random() - 0.5))),
        myProductivity: Math.max(80, Math.min(100, prev.myProductivity + (Math.random() - 0.5))),
        myHoursToday: Math.max(6, Math.min(10, prev.myHoursToday + (Math.random() - 0.5) * 0.5)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Admin dashboard metrics
  const adminMetrics = [
    {
      title: "Active Workforce",
      value: realtimeData.activeEmployees.toString(),
      change: "+5.2%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up"
    },
    {
      title: "Active Projects",
      value: realtimeData.ongoingProjects.toString(),
      change: "+2 this week",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Client Satisfaction",
      value: `${realtimeData.clientSatisfaction.toFixed(1)}%`,
      change: "+2.1%",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "up"
    },
    {
      title: "Monthly Revenue",
      value: `$${(realtimeData.revenue / 1000).toFixed(0)}K`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "up"
    }
  ];

  // Employee dashboard metrics
  const employeeMetrics = [
    {
      title: "My Productivity",
      value: `${realtimeData.myProductivity.toFixed(1)}%`,
      change: "+3.2%",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up"
    },
    {
      title: "Hours Today",
      value: `${realtimeData.myHoursToday.toFixed(1)}h`,
      change: "on track",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Tasks Completed",
      value: realtimeData.myTasksCompleted.toString(),
      change: "+2 today",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "up"
    },
    {
      title: "Team Rating",
      value: `${realtimeData.myTeamRating.toFixed(1)}/5`,
      change: "excellent",
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "up"
    }
  ];

  const urgentAlerts = [
    { id: 1, type: "warning", message: "3 employees need visa renewal within 30 days", priority: "high" },
    { id: 2, type: "info", message: "New project assignment available for skilled welders", priority: "medium" },
    { id: 3, type: "error", message: "2 timesheets pending approval for over 48 hours", priority: "high" },
  ];

  const dashboardMetrics = userRole === "admin" ? adminMetrics : employeeMetrics;

  return (
    <div className="space-y-6">
      {/* Real-time Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-full`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgent Alerts - Only show for admin */}
      {userRole === "admin" && urgentAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Urgent Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded-md">
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs - Only show for admin */}
      {userRole === "admin" && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealtimeMetrics />
              <ProjectStatus />
            </div>
          </TabsContent>

          <TabsContent value="workforce" className="space-y-4">
            <WorkforceMap />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <ProjectStatus />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <PerformanceInsights />
          </TabsContent>
        </Tabs>
      )}

      {/* Employee-specific content */}
      {userRole === "employee" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                My Performance Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-lg font-bold">{realtimeData.myTasksCompleted}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hours Worked</span>
                  <span className="text-lg font-bold">{realtimeData.myHoursToday.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Productivity Score</span>
                  <span className="text-lg font-bold text-green-600">{realtimeData.myProductivity.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Submit Timesheet
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Team Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
