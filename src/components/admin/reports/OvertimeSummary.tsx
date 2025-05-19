
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Employee } from "@/types";

// Colors for pie chart
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

interface OvertimeEmployeeData {
  name: string;
  hours: number;
  department?: string;
}

interface OvertimeDepartmentData {
  name: string;
  value: number;
}

interface OvertimeDayData {
  day: string;
  hours: number;
}

export const OvertimeSummary = () => {
  const [overtimeByEmployee, setOvertimeByEmployee] = useState<OvertimeEmployeeData[]>([]);
  const [overtimeByDepartment, setOvertimeByDepartment] = useState<OvertimeDepartmentData[]>([]);
  const [overtimeByDay, setOvertimeByDay] = useState<OvertimeDayData[]>([]);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [avgOvertime, setAvgOvertime] = useState(0);
  const [peakDay, setPeakDay] = useState("N/A");
  const [peakDayHours, setPeakDayHours] = useState(0);
  
  useEffect(() => {
    // Get all employees
    const employees = JSON.parse(localStorage.getItem("employees") || "[]") as Employee[];
    
    if (employees.length === 0) {
      // No data to show
      return;
    }
    
    // In a real app, we would calculate these from actual timesheet data
    // For this example, we'll generate representative data based on employees
    
    // Generate overtime by employee (top 5)
    const employeeOvertimeData: OvertimeEmployeeData[] = employees
      .map(emp => ({
        name: emp.name || "Unknown",
        hours: Math.floor(Math.random() * 10), // Random hours between 0-9
        department: emp.department
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
    
    setOvertimeByEmployee(employeeOvertimeData);
    
    // Generate overtime by department
    const departmentMap = new Map<string, number>();
    
    employeeOvertimeData.forEach(emp => {
      if (emp.department) {
        const current = departmentMap.get(emp.department) || 0;
        departmentMap.set(emp.department, current + emp.hours);
      }
    });
    
    const departmentOvertimeData: OvertimeDepartmentData[] = [];
    departmentMap.forEach((hours, dept) => {
      departmentOvertimeData.push({
        name: dept,
        value: hours
      });
    });
    
    setOvertimeByDepartment(departmentOvertimeData);
    
    // Generate overtime by day
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayOvertimeData: OvertimeDayData[] = days.map(day => ({
      day,
      hours: Math.floor(Math.random() * 10) // Random hours between 0-9
    }));
    
    setOvertimeByDay(dayOvertimeData);
    
    // Calculate totals and averages
    const totalHours = employeeOvertimeData.reduce((sum, emp) => sum + emp.hours, 0);
    setTotalOvertime(totalHours);
    
    const avgHours = employees.length > 0 ? totalHours / employees.length : 0;
    setAvgOvertime(parseFloat(avgHours.toFixed(1)));
    
    // Find peak day
    const peakDayData = dayOvertimeData.reduce((max, day) => 
      day.hours > max.hours ? day : max, { day: "", hours: 0 });
    
    setPeakDay(peakDayData.day);
    setPeakDayHours(peakDayData.hours);
    
  }, []);
  
  if (overtimeByEmployee.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No overtime data available. Add employees and timesheets first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Total Overtime</h3>
          <div className="text-4xl font-bold text-center my-4">
            {totalOvertime} <span className="text-lg font-normal text-gray-500">hours</span>
          </div>
          <div className="text-sm text-center text-gray-500">
            For current period
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Avg. Overtime</h3>
          <div className="text-4xl font-bold text-center my-4">
            {avgOvertime} <span className="text-lg font-normal text-gray-500">hours/employee</span>
          </div>
          <div className="text-sm text-center text-gray-500">
            Across all departments
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Peak Day</h3>
          <div className="text-4xl font-bold text-center my-4">
            {peakDay}
          </div>
          <div className="text-sm text-center text-gray-500">
            {peakDayHours} hours total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Overtime by Employee (Top 5)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overtimeByEmployee}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 60,
                  bottom: 5,
                }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="hours" fill="#8884d8" name="Overtime Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Overtime by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overtimeByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, value, percent}) => `${name}: ${value}h (${(percent * 100).toFixed(0)}%)`}
                >
                  {overtimeByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Overtime by Day of Week</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overtimeByDay}
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
      </div>

      {/* Printable version - only appears when printing */}
      <div className="hidden print:block mt-8">
        <h2 className="text-2xl font-bold mb-6">Overtime Summary Report</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">Key Metrics</h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-medium">Total Overtime:</td>
                <td className="border px-4 py-2">{totalOvertime} hours</td>
                <td className="border px-4 py-2 font-medium">Avg Per Employee:</td>
                <td className="border px-4 py-2">{avgOvertime} hours</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-medium">Peak Day:</td>
                <td className="border px-4 py-2">{peakDay} ({peakDayHours} hours)</td>
                <td className="border px-4 py-2 font-medium">Report Period:</td>
                <td className="border px-4 py-2">Current Period</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">Overtime by Employee</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Employee</th>
                <th className="border px-4 py-2 text-left">Overtime Hours</th>
              </tr>
            </thead>
            <tbody>
              {overtimeByEmployee.map(emp => (
                <tr key={emp.name}>
                  <td className="border px-4 py-2">{emp.name}</td>
                  <td className="border px-4 py-2">{emp.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">Overtime by Department</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Department</th>
                <th className="border px-4 py-2 text-left">Overtime Hours</th>
                <th className="border px-4 py-2 text-left">Percentage of Total</th>
              </tr>
            </thead>
            <tbody>
              {overtimeByDepartment.map(dept => (
                <tr key={dept.name}>
                  <td className="border px-4 py-2">{dept.name}</td>
                  <td className="border px-4 py-2">{dept.value}</td>
                  <td className="border px-4 py-2">{((dept.value / totalOvertime) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
