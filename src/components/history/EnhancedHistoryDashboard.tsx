
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, FileText, Download } from "lucide-react";
import { YearView } from "./YearView";
import { MonthView } from "./MonthView";
import { DayView } from "./DayView";
import { TimesheetAnalytics } from "./TimesheetAnalytics";
import { AdvancedFilters } from "./AdvancedFilters";
import { Timesheet } from "@/types";

interface EnhancedHistoryDashboardProps {
  timesheets: Timesheet[];
  onExport: () => void;
}

export const EnhancedHistoryDashboard = ({ timesheets, onExport }: EnhancedHistoryDashboardProps) => {
  const [selectedView, setSelectedView] = useState<"year" | "month" | "day">("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>(timesheets);

  useEffect(() => {
    setFilteredTimesheets(timesheets);
  }, [timesheets]);

  const handleFilterChange = (filters: any) => {
    // Apply filters to timesheets
    let filtered = timesheets;
    
    if (filters.dateRange) {
      filtered = filtered.filter(ts => {
        const tsDate = new Date(ts.year, ts.month - 1);
        return tsDate >= filters.dateRange.from && tsDate <= filters.dateRange.to;
      });
    }
    
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(ts => filters.status.includes(ts.status));
    }
    
    setFilteredTimesheets(filtered);
  };

  const getViewTitle = () => {
    switch (selectedView) {
      case "year":
        return `Year ${selectedYear} Overview`;
      case "month":
        return `${getMonthName(selectedMonth)} ${selectedYear}`;
      case "day":
        return selectedDate ? `${selectedDate.toDateString()}` : "Select a Date";
      default:
        return "Timesheet History";
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Timesheet History</h1>
          <p className="text-gray-600">{getViewTitle()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters onFilterChange={handleFilterChange} />

      {/* View Selector */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="year" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Year View
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Month View
          </TabsTrigger>
          <TabsTrigger value="day" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Day View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="year" className="mt-6">
          <YearView 
            timesheets={filteredTimesheets} 
            year={selectedYear}
            onYearChange={setSelectedYear}
            onMonthSelect={(month) => {
              setSelectedMonth(month);
              setSelectedView("month");
            }}
          />
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <MonthView 
            timesheets={filteredTimesheets}
            year={selectedYear}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setSelectedView("day");
            }}
          />
        </TabsContent>

        <TabsContent value="day" className="mt-6">
          <DayView 
            timesheets={filteredTimesheets}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <TimesheetAnalytics timesheets={filteredTimesheets} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
