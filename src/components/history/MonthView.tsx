
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Timesheet, TimesheetEntry } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface MonthViewProps {
  timesheets: Timesheet[];
  year: number;
  month: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDateSelect: (date: Date) => void;
}

export const MonthView = ({ timesheets, year, month, onMonthChange, onYearChange, onDateSelect }: MonthViewProps) => {
  const currentMonth = new Date(year, month - 1);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthTimesheet = timesheets.find(ts => ts.year === year && ts.month === month);
  
  const getEntryForDate = (date: Date): TimesheetEntry | null => {
    if (!monthTimesheet) return null;
    
    const dateStr = format(date, "dd-MMM-yyyy");
    return monthTimesheet.entries.find(entry => entry.date === dateStr) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateMonthStats = () => {
    if (!monthTimesheet) return { totalHours: 0, workingDays: 0, averageDaily: 0, overtime: 0 };
    
    let totalHours = 0;
    let workingDays = 0;
    let overtime = 0;
    
    monthTimesheet.entries.forEach(entry => {
      if (entry.totalHours > 0) {
        totalHours += entry.totalHours;
        workingDays++;
        if (entry.totalHours > 8) {
          overtime += entry.totalHours - 8;
        }
      }
    });
    
    return {
      totalHours,
      workingDays,
      averageDaily: workingDays > 0 ? totalHours / workingDays : 0,
      overtime
    };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (month === 1) {
        onYearChange(year - 1);
        onMonthChange(12);
      } else {
        onMonthChange(month - 1);
      }
    } else {
      if (month === 12) {
        onYearChange(year + 1);
        onMonthChange(1);
      } else {
        onMonthChange(month + 1);
      }
    }
  };

  const stats = calculateMonthStats();
  const monthName = format(currentMonth, "MMMM yyyy");

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={month.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {format(new Date(2024, i), "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={year.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-sm text-gray-600">Total Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
            <p className="text-sm text-gray-600">Working Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.averageDaily.toFixed(1)}h</div>
            <p className="text-sm text-gray-600">Average Daily</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.overtime.toFixed(1)}h</div>
            <p className="text-sm text-gray-600">Overtime</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(date => {
              const entry = getEntryForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <Button
                  key={date.toISOString()}
                  variant="outline"
                  className={`h-20 p-2 flex flex-col justify-start items-start hover:bg-gray-50 ${
                    isToday ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => onDateSelect(date)}
                >
                  <span className="text-sm font-medium">{format(date, "d")}</span>
                  {entry && (
                    <div className="mt-1 space-y-1 w-full">
                      <div className="text-xs text-blue-600 font-medium">
                        {entry.totalHours.toFixed(1)}h
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1 py-0 ${getStatusColor(entry.status)}`}
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Status Legend:</span>
            <Badge className="bg-green-100 text-green-800">Approved</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
