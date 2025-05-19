
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for department summary
const departmentData = [
  {
    department: "Engineering",
    regularHours: 160,
    overtimeHours: 12,
    employees: 8,
    avgHours: 21.5,
  },
  {
    department: "Marketing",
    regularHours: 140,
    overtimeHours: 8,
    employees: 6,
    avgHours: 24.7,
  },
  {
    department: "Finance",
    regularHours: 120,
    overtimeHours: 5,
    employees: 5,
    avgHours: 25.0,
  },
  {
    department: "HR",
    regularHours: 100,
    overtimeHours: 0,
    employees: 4,
    avgHours: 25.0,
  }
];

export const DepartmentSummaryReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {departmentData.map(dept => (
          <Card key={dept.department} className="p-4">
            <h3 className="font-medium text-sm text-gray-500">{dept.department}</h3>
            <p className="text-2xl font-bold">{dept.regularHours + dept.overtimeHours}h</p>
            <div className="text-sm text-gray-500 mt-1">
              {dept.employees} employees
            </div>
          </Card>
        ))}
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Hours by Department</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="regularHours" name="Regular Hours" fill="#8884d8" />
              <Bar dataKey="overtimeHours" name="Overtime Hours" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Printable version - only appears when printing */}
      <div className="hidden print:block mt-8">
        <h2 className="text-2xl font-bold mb-6">Department Summary Report</h2>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Department</th>
              <th className="border px-4 py-2 text-left">Regular Hours</th>
              <th className="border px-4 py-2 text-left">Overtime Hours</th>
              <th className="border px-4 py-2 text-left">Total Hours</th>
              <th className="border px-4 py-2 text-left">Employees</th>
              <th className="border px-4 py-2 text-left">Avg Hours/Employee</th>
            </tr>
          </thead>
          <tbody>
            {departmentData.map(dept => (
              <tr key={dept.department}>
                <td className="border px-4 py-2">{dept.department}</td>
                <td className="border px-4 py-2">{dept.regularHours}</td>
                <td className="border px-4 py-2">{dept.overtimeHours}</td>
                <td className="border px-4 py-2">{dept.regularHours + dept.overtimeHours}</td>
                <td className="border px-4 py-2">{dept.employees}</td>
                <td className="border px-4 py-2">{dept.avgHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
