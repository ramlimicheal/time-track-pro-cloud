
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Clock, TrendingUp, Award } from "lucide-react";
import { Timesheet, TimesheetEntry } from "@/types";

interface YearViewProps {
  timesheets: Timesheet[];
  year: number;
  onYearChange: (year: number) => void;
  onMonthSelect: (month: number) => void;
}

export const YearView = ({ timesheets, year, onYearChange, onMonthSelect }: YearViewProps) => {
  // Optimization: Memoize filtered timesheets to avoid filtering on every render
  const yearTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.year === year);
  }, [timesheets, year]);
  
  // Optimization: Memoize year stats calculation
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalDays = 0;
    let overtimeHours = 0;
    
    yearTimesheets.forEach(timesheet => {
      timesheet.entries.forEach((entry: TimesheetEntry) => {
        totalHours += entry.totalHours;
        if (entry.totalHours > 0) totalDays++;
        if (entry.totalHours > 8) {
          overtimeHours += entry.totalHours - 8;
        }
      });
    });
    
    return {
      totalHours: totalHours.toFixed(1),
      totalDays,
      averageDaily: totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "0",
      overtimeHours: overtimeHours.toFixed(1)
    };
  }, [yearTimesheets]);

  // Optimization: Memoize monthly data calculation
  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      monthNumber: i + 1,
      hours: 0,
      days: 0
    }));

    yearTimesheets.forEach(timesheet => {
      const monthIndex = timesheet.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        timesheet.entries.forEach((entry: TimesheetEntry) => {
          data[monthIndex].hours += entry.totalHours;
          if (entry.totalHours > 0) data[monthIndex].days++;
        });
      }
    });

    return data;
  }, [yearTimesheets]);

  // Optimization: Memoize available years
  const availableYears = useMemo(() => {
    return [...new Set(timesheets.map(ts => ts.year))].sort((a, b) => b - a);
  }, [timesheets]);

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Year Overview</h2>
        <Select value={year.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
            <p className="text-xs text-gray-600">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalDays}</div>
            <p className="text-xs text-gray-600">Days worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageDaily}h</div>
            <p className="text-xs text-gray-600">Per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overtimeHours}h</div>
            <p className="text-xs text-gray-600">Extra hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Hours Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}h`, name === 'hours' ? 'Hours Worked' : 'Days']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Month Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Navigate to Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {monthlyData.map((month, index) => (
              <Button
                key={month.month}
                variant="outline"
                className="flex flex-col p-4 h-auto"
                onClick={() => onMonthSelect(month.monthNumber)}
              >
                <span className="font-medium">{month.month}</span>
                <span className="text-sm text-gray-600">{month.hours.toFixed(0)}h</span>
                <span className="text-xs text-gray-500">{month.days} days</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
