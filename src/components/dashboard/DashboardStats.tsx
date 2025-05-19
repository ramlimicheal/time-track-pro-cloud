
import { Employee } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileX } from "lucide-react";

interface DashboardStatsProps {
  employee: Employee;
}

export const DashboardStats = ({ employee }: DashboardStatsProps) => {
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
      title: "Pending Timesheets",
      value: employee.pendingTimesheets.toString(),
      change: employee.pendingTimesheets > 0 ? "Action needed" : "All complete",
      icon: FileCheck,
      color: "text-green-500",
      bgColor: "bg-green-100"
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
