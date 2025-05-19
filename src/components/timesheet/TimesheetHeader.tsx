
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timesheet } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimesheetHeaderProps {
  employeeName: string;
  month: string;
  year: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  onNewTimesheet: () => void;
  timesheetStatus?: Timesheet["status"];
  onDateChange?: (date: Date) => void;
  selectedDate?: Date;
}

export const TimesheetHeader: React.FC<TimesheetHeaderProps> = ({
  employeeName,
  month,
  year,
  onMonthChange,
  onYearChange,
  onNewTimesheet,
  timesheetStatus = "draft",
  onDateChange,
  selectedDate
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusColor = statusColors[timesheetStatus];
  
  // Create a date object from the current month and year
  const [date, setDate] = useState<Date>(() => {
    const monthIndex = months.indexOf(month);
    return new Date(year, monthIndex, 1);
  });

  // Use selectedDate if provided, otherwise use the date state
  const displayDate = selectedDate || date;

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const newMonth = months[newDate.getMonth()];
      const newYear = newDate.getFullYear();
      onMonthChange(newMonth);
      onYearChange(newYear);
      if (onDateChange) onDateChange(newDate);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Employee
          </label>
          <div className="h-10 px-4 py-2 flex items-center border border-gray-200 rounded-md bg-gray-50 text-sm font-medium">
            {employeeName}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Month/Year
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 text-sm border-gray-200 hover:bg-gray-50",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                {format(displayDate, "MMMM yyyy")}
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {format(displayDate, "EEE")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={displayDate}
                onSelect={handleDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <span className={`px-3 py-1.5 rounded-md text-xs font-medium inline-block ${statusColor}`}>
              {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}
            </span>
          </div>
          
          <Button 
            onClick={onNewTimesheet} 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 h-10 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
};
