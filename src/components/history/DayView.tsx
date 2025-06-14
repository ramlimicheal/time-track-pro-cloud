
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Clock, FileText, User, Calendar as CalendarIcon } from "lucide-react";
import { Timesheet, TimesheetEntry } from "@/types";
import { format } from "date-fns";

interface DayViewProps {
  timesheets: Timesheet[];
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export const DayView = ({ timesheets, selectedDate, onDateChange }: DayViewProps) => {
  const getEntryForDate = (date: Date): { entry: TimesheetEntry | null; timesheet: Timesheet | null } => {
    if (!date) return { entry: null, timesheet: null };
    
    const dateStr = format(date, "dd-MMM-yyyy");
    
    for (const timesheet of timesheets) {
      const entry = timesheet.entries.find(e => e.date === dateStr);
      if (entry) {
        return { entry, timesheet };
      }
    }
    
    return { entry: null, timesheet: null };
  };

  const { entry, timesheet } = selectedDate ? getEntryForDate(selectedDate) : { entry: null, timesheet: null };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateBreakTime = (entry: TimesheetEntry) => {
    if (!entry.breakStart || !entry.breakEnd) return "No break recorded";
    
    const start = new Date(`2000-01-01 ${entry.breakStart}`);
    const end = new Date(`2000-01-01 ${entry.breakEnd}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = diffMs / (1000 * 60);
    
    if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return "Not recorded";
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Picker */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => onDateChange(date || null)}
              className="rounded-md border"
              modifiers={{
                hasEntry: (date) => {
                  const { entry } = getEntryForDate(date);
                  return !!entry;
                }
              }}
              modifiersStyles={{
                hasEntry: {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Legend:</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Has timesheet entry</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Day Details
              </div>
              {selectedDate && (
                <span className="text-lg font-normal text-gray-600">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Date Selected</h3>
                <p className="text-gray-500">Please select a date from the calendar to view details</p>
              </div>
            ) : !entry ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Entry Found</h3>
                <p className="text-gray-500">
                  No timesheet entry was found for {format(selectedDate, "MMMM d, yyyy")}
                </p>
                <Button className="mt-4" variant="outline">
                  Create Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status and Employee Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{timesheet?.employeeName}</p>
                      <p className="text-sm text-gray-600">Employee</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(entry.status)} font-medium`}>
                    {entry.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Time Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{entry.totalHours.toFixed(2)}h</div>
                    <p className="text-sm text-blue-700">Total Hours</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatTimeRange(entry.workStart, entry.workEnd)}
                    </div>
                    <p className="text-sm text-green-700">Work Hours</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {calculateBreakTime(entry)}
                    </div>
                    <p className="text-sm text-purple-700">Break Time</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {formatTimeRange(entry.otStart, entry.otEnd)}
                    </div>
                    <p className="text-sm text-orange-700">Overtime</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Time Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Work Start:</span>
                        <span className="font-medium">{entry.workStart || "Not recorded"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Work End:</span>
                        <span className="font-medium">{entry.workEnd || "Not recorded"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Break Start:</span>
                        <span className="font-medium">{entry.breakStart || "Not taken"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Break End:</span>
                        <span className="font-medium">{entry.breakEnd || "Not taken"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">OT Start:</span>
                        <span className="font-medium">{entry.otStart || "No overtime"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">OT End:</span>
                        <span className="font-medium">{entry.otEnd || "No overtime"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium text-blue-600">{entry.totalHours.toFixed(2)} hours</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Description */}
                {entry.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Work Description</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{entry.description}</p>
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {entry.remarks && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Remarks</h4>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-gray-700">{entry.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
