import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Calendar, Award } from "lucide-react";
import { Timesheet } from "@/types";
import { calculateTimesheetAnalytics } from "@/utils/timesheetAnalytics";

interface TimesheetAnalyticsProps {
  timesheets: Timesheet[];
}

export const TimesheetAnalytics = ({ timesheets }: TimesheetAnalyticsProps) => {
  const { stats, monthlyTrends, statusDistribution, workPatterns } = useMemo(
    () => calculateTimesheetAnalytics(timesheets),
    [timesheets]
  );

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-gray-600">Across all timesheets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
            <p className="text-xs text-gray-600">Days with entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageDaily.toFixed(1)}h</div>
            <p className="text-xs text-gray-600">Per working day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-gray-600">Extra hours worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Hours Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'hours' ? `${value}h` : 
                      name === 'average' ? `${Number(value).toFixed(1)}h` : value,
                      name === 'hours' ? 'Total Hours' : 
                      name === 'average' ? 'Daily Average' : name
                    ]}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Entries']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Work Start Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Work Start Time Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Entries']}
                    labelFormatter={(label) => `Start Time: ${label}`}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overtime Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overtime Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}h`, 'Overtime Hours']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="overtime" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Overall Productivity</h4>
              <div className="text-2xl font-bold text-blue-600">{stats.productivity.toFixed(1)}%</div>
              <p className="text-sm text-blue-700">Based on 8-hour standard</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Consistency Score</h4>
              <div className="text-2xl font-bold text-green-600">
                {timesheets.length > 0 ? ((stats.workingDays / (timesheets.length * 22)) * 100).toFixed(1) : "0.0"}%
              </div>
              <p className="text-sm text-green-700">Days worked vs available</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Overtime Rate</h4>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalHours > 0 ? ((stats.overtimeHours / stats.totalHours) * 100).toFixed(1) : "0.0"}%
              </div>
              <p className="text-sm text-purple-700">Of total hours worked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
