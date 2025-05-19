
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Timesheet } from "@/types";

interface TimesheetHeaderProps {
  employeeName: string;
  month: string;
  year: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  onNewTimesheet: () => void;
  timesheetStatus?: Timesheet["status"];
}

export const TimesheetHeader: React.FC<TimesheetHeaderProps> = ({
  employeeName,
  month,
  year,
  onMonthChange,
  onYearChange,
  onNewTimesheet,
  timesheetStatus = "draft"
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusColor = statusColors[timesheetStatus];

  return (
    <div className="bg-white p-6 rounded-md shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name
          </label>
          <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            {employeeName}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span className={`px-3 py-2 rounded-md inline-block ${statusColor}`}>
              {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}
            </span>
          </div>
          
          <Button onClick={onNewTimesheet} className="bg-green-600 hover:bg-green-700">
            + New Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
};
