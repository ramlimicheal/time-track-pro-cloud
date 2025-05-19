import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types";

interface TimesheetAnalyticsProps {
  employees: Employee[];
}

export const TimesheetAnalytics = ({ employees }: TimesheetAnalyticsProps) => {
  const [timePeriod, setTimePeriod] = useState("may2025");
  
  // Mock data for charts
  const departmentHoursData = [
    { department: "Engineering", hours: 420, employees: 8 },
    { department: "Marketing", hours: 380, employees: 6 },
    { department: "Finance", hours: 320, employees: 5 },
    { department: "HR", hours: 220, employees: 4 },
    { department: "Operations", hours: 280, employees: 4 },
  ];
  
  const timesheetStatusData = [
    { name: "Approved", value: 78 },
    { name: "Pending", value: 15 },
    { name: "Rejected", value: 7 },
  ];
  
  const overtimeByDayData = [
    { day: "Mon", hours: 12 },
    { day: "Tue", hours: 8 },
    { day: "Wed", hours: 5 },
    { day: "Thu", hours: 14 },
    { day: "Fri", hours: 18 },
    { day: "Sat", hours: 3 },
    { day: "Sun", hours: 0 },
  ];
  
  // Colors for pie chart
  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];
  
  // Calculate summary data
  const totalHours = departmentHoursData.reduce((sum, dept) => sum + dept.hours, 0);
  const totalEmployees = departmentHoursData.reduce((sum, dept) => sum + dept.employees, 0);
  const avgHoursPerEmployee = totalHours / totalEmployees;
  const overtimeHours = overtimeByDayData.reduce((sum, day) => sum + day.hours, 0);

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-end mb-6">
        <div className="w-[200px]">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="may2025">May 2025</SelectItem>
              <SelectItem value="apr2025">April 2025</SelectItem>
              <SelectItem value="mar2025">March 2025</SelectItem>
              <SelectItem value="feb2025">February 2025</SelectItem>
              <SelectItem value="jan2025">January 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Hours/Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursPerEmployee.toFixed(1)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overtimeHours}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hours by Department</CardTitle>
            <CardDescription>Total working hours logged by each department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentHoursData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" name="Total Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Timesheet Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Timesheet Status</CardTitle>
            <CardDescription>Distribution of timesheet approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timesheetStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {timesheetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Overtime Hours Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overtime by Day</CardTitle>
            <CardDescription>Total overtime hours logged by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overtimeByDayData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#82ca9d" name="Overtime Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
