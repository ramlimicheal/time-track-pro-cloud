
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for overtime report
const overtimeByEmployee = [
  { name: "John Employee", hours: 12 },
  { name: "Sarah Smith", hours: 8 },
  { name: "Michael Brown", hours: 6 },
  { name: "Emily Johnson", hours: 5 },
  { name: "Robert Williams", hours: 4 },
];

const overtimeByDepartment = [
  { name: "Engineering", value: 22 },
  { name: "Marketing", value: 8 },
  { name: "Finance", value: 5 },
  { name: "HR", value: 0 },
];

const overtimeByDay = [
  { day: "Mon", hours: 5 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 2 },
  { day: "Thu", hours: 8 },
  { day: "Fri", hours: 12 },
  { day: "Sat", hours: 6 },
  { day: "Sun", hours: 1 },
];

// Colors for pie chart
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export const OvertimeSummary = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Total Overtime</h3>
          <div className="text-4xl font-bold text-center my-4">
            35 <span className="text-lg font-normal text-gray-500">hours</span>
          </div>
          <div className="text-sm text-center text-gray-500">
            For May 2025
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Avg. Overtime</h3>
          <div className="text-4xl font-bold text-center my-4">
            2.5 <span className="text-lg font-normal text-gray-500">hours/employee</span>
          </div>
          <div className="text-sm text-center text-gray-500">
            Across all departments
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Peak Day</h3>
          <div className="text-4xl font-bold text-center my-4">
            Friday
          </div>
          <div className="text-sm text-center text-gray-500">
            12 hours total
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
                <td className="border px-4 py-2">35 hours</td>
                <td className="border px-4 py-2 font-medium">Avg Per Employee:</td>
                <td className="border px-4 py-2">2.5 hours</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-medium">Peak Day:</td>
                <td className="border px-4 py-2">Friday (12 hours)</td>
                <td className="border px-4 py-2 font-medium">Report Period:</td>
                <td className="border px-4 py-2">May 2025</td>
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
                  <td className="border px-4 py-2">{((dept.value / 35) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
