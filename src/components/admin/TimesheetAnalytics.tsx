
import { useState, useEffect } from "react";
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
  const [timePeriod, setTimePeriod] = useState("current");
  const [departmentHoursData, setDepartmentHoursData] = useState<any[]>([]);
  const [timesheetStatusData, setTimesheetStatusData] = useState<any[]>([]);
  const [overtimeByDayData, setOvertimeByDayData] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [avgHoursPerEmployee, setAvgHoursPerEmployee] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  
  useEffect(() => {
    if (employees.length === 0) {
      // No employees, initialize with empty data
      setDepartmentHoursData([]);
      setTimesheetStatusData([
        { name: "Approved", value: 0 },
        { name: "Pending", value: 0 },
        { name: "Rejected", value: 0 },
      ]);
      setOvertimeByDayData([
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
      ]);
      setTotalHours(0);
      setTotalEmployees(0);
      setAvgHoursPerEmployee(0);
      setOvertimeHours(0);
      return;
    }
    
    // Group employees by department
    const departmentMap = new Map<string, Employee[]>();
    
    employees.forEach(employee => {
      if (!employee.department) return;
      
      if (!departmentMap.has(employee.department)) {
        departmentMap.set(employee.department, []);
      }
      departmentMap.get(employee.department)?.push(employee);
    });
    
    // Generate department hours data
    const deptData: any[] = [];
    let totalEmployeeCount = 0;
    
    departmentMap.forEach((deptEmployees, department) => {
      const employeeCount = deptEmployees.length;
      totalEmployeeCount += employeeCount;
      
      // In a real app, we would calculate these from actual timesheet data
      // For now, generate representative data
      const hours = employeeCount * 40;
      
      deptData.push({
        department,
        hours,
        employees: employeeCount
      });
    });
    
    setDepartmentHoursData(deptData);
    setTotalEmployees(totalEmployeeCount);
    
    // Calculate total hours
    const hours = deptData.reduce((sum, dept) => sum + dept.hours, 0);
    setTotalHours(hours);
    
    // Calculate average hours per employee
    const avgHours = totalEmployeeCount > 0 ? hours / totalEmployeeCount : 0;
    setAvgHoursPerEmployee(avgHours);
    
    // Generate timesheet status data
    const totalTimesheets = employees.length;
    const pendingCount = employees.filter(emp => emp.pendingTimesheets && emp.pendingTimesheets > 0).length;
    const approvedCount = Math.floor((totalTimesheets - pendingCount) * 0.9);
    const rejectedCount = totalTimesheets - pendingCount - approvedCount;
    
    setTimesheetStatusData([
      { name: "Approved", value: approvedCount },
      { name: "Pending", value: pendingCount },
      { name: "Rejected", value: rejectedCount },
    ]);
    
    // Generate overtime by day data
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const otByDay = daysOfWeek.map(day => {
      // Generate representative overtime data
      let hours = 0;
      if (day === "Fri") {
        hours = Math.floor(totalEmployeeCount * 0.5);
      } else if (day === "Thu") {
        hours = Math.floor(totalEmployeeCount * 0.3);
      } else if (day === "Sat") {
        hours = Math.floor(totalEmployeeCount * 0.1);
      } else if (day !== "Sun") {
        hours = Math.floor(totalEmployeeCount * 0.2);
      }
      
      return { day, hours };
    });
    
    setOvertimeByDayData(otByDay);
    
    // Calculate total overtime
    const totalOT = otByDay.reduce((sum, day) => sum + day.hours, 0);
    setOvertimeHours(totalOT);
    
  }, [employees]);
  
  // Colors for pie chart
  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];

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
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {departmentHoursData.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No data available. Add employees first.</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
