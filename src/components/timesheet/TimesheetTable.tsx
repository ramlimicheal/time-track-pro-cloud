
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimesheetEntry } from "@/types";
import { TimeIcon } from "@/components/TimeIcon";
import { toast } from "sonner";

interface TimesheetTableProps {
  month: string;
  year: number;
  entries: TimesheetEntry[];
  onSave?: (entries: TimesheetEntry[]) => void;
  readOnly?: boolean;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  month,
  year,
  entries,
  onSave,
  readOnly = false,
}) => {
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(entries);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Validate time format (HH:MM)
  const isValidTimeFormat = (time: string): boolean => {
    if (!time) return true; // Empty is valid
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  // Calculate hours between two time strings
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return 0;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Handle case where end time is on the next day
    const diffMinutes = endTotalMinutes >= startTotalMinutes 
      ? endTotalMinutes - startTotalMinutes 
      : (24 * 60) - startTotalMinutes + endTotalMinutes;
    
    return Number((diffMinutes / 60).toFixed(2));
  };

  // Calculate break hours
  const calculateBreakHours = (breakStart: string, breakEnd: string): number => {
    return calculateHours(breakStart, breakEnd);
  };

  // Update entry and recalculate hours
  const updateEntry = (
    id: string,
    field: keyof TimesheetEntry,
    value: string | number
  ) => {
    const updatedEntries = localEntries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = {
          ...entry,
          [field]: value,
        };

        // If this is a time field, recalculate total hours
        if (
          field === "workStart" || 
          field === "workEnd" || 
          field === "breakStart" || 
          field === "breakEnd" ||
          field === "otStart" ||
          field === "otEnd"
        ) {
          // Calculate regular work hours
          const workHours = calculateHours(updatedEntry.workStart, updatedEntry.workEnd);
          
          // Calculate break hours
          const breakHours = calculateBreakHours(updatedEntry.breakStart, updatedEntry.breakEnd);
          
          // Calculate overtime hours
          const otHours = calculateHours(updatedEntry.otStart, updatedEntry.otEnd);
          
          // Calculate total hours (work hours - break hours + overtime hours)
          const netWorkHours = Math.max(0, workHours - breakHours);
          updatedEntry.totalHours = netWorkHours + otHours;
        }

        return updatedEntry;
      }
      return entry;
    });
    setLocalEntries(updatedEntries);
  };

  const validateEntry = (entry: TimesheetEntry): boolean => {
    // Check if work start and end times are filled and valid
    if (entry.workStart && entry.workEnd) {
      if (!isValidTimeFormat(entry.workStart) || !isValidTimeFormat(entry.workEnd)) {
        return false;
      }
    }
    
    // Check if break times are both filled or both empty
    if ((entry.breakStart && !entry.breakEnd) || (!entry.breakStart && entry.breakEnd)) {
      return false;
    }
    
    // Check if OT times are both filled or both empty
    if ((entry.otStart && !entry.otEnd) || (!entry.otStart && entry.otEnd)) {
      return false;
    }
    
    // Validate break times if they exist
    if (entry.breakStart && entry.breakEnd) {
      if (!isValidTimeFormat(entry.breakStart) || !isValidTimeFormat(entry.breakEnd)) {
        return false;
      }
    }
    
    // Validate OT times if they exist
    if (entry.otStart && entry.otEnd) {
      if (!isValidTimeFormat(entry.otStart) || !isValidTimeFormat(entry.otEnd)) {
        return false;
      }
    }
    
    return true;
  };

  const handleSave = () => {
    // Validate all entries
    const invalidEntries = localEntries.filter(entry => 
      (entry.workStart || entry.workEnd || entry.description) && !validateEntry(entry)
    );
    
    if (invalidEntries.length > 0) {
      toast.error("Please fix invalid time entries before saving");
      return;
    }
    
    if (onSave) {
      // Update status to pending for entries with times
      const updatedEntries = localEntries.map(entry => {
        if ((entry.workStart || entry.otStart) && entry.status === "draft") {
          return { ...entry, status: "pending" as const };
        }
        return entry;
      });
      
      onSave(updatedEntries);
      toast.success("Timesheet saved successfully and submitted for approval");
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 bg-timetrack-lightBlue border-b border-gray-200">
        <h2 className="text-xl font-semibold text-center">
          Timesheet for {month} {year}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full timesheet-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>
                <div className="flex items-center gap-1">
                  WORK START
                  <TimeIcon />
                </div>
              </th>
              <th>
                <div className="flex items-center gap-1">
                  BREAK START
                  <TimeIcon />
                </div>
              </th>
              <th>
                <div className="flex items-center gap-1">
                  BREAK END
                  <TimeIcon />
                </div>
              </th>
              <th>
                <div className="flex items-center gap-1">
                  WORK END
                  <TimeIcon />
                </div>
              </th>
              <th>DESCRIPTION</th>
              <th>
                <div className="flex items-center gap-1">
                  OT START
                  <TimeIcon />
                </div>
              </th>
              <th>
                <div className="flex items-center gap-1">
                  OT END
                  <TimeIcon />
                </div>
              </th>
              <th>TOTAL HOURS</th>
              <th>REMARKS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {localEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap">{entry.date}</td>
                <td>
                  <Input
                    type="text"
                    value={entry.workStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "workStart", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.workStart) && entry.workStart ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.breakStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "breakStart", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.breakStart) && entry.breakStart ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.breakEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "breakEnd", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.breakEnd) && entry.breakEnd ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.workEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "workEnd", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.workEnd) && entry.workEnd ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.description}
                    onChange={(e) =>
                      updateEntry(entry.id, "description", e.target.value)
                    }
                    placeholder="Enter description"
                    className="w-full"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.otStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "otStart", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.otStart) && entry.otStart ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.otEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "otEnd", e.target.value)
                    }
                    className={`time-input ${!isValidTimeFormat(entry.otEnd) && entry.otEnd ? "border-red-500" : ""}`}
                    placeholder="HH:MM"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td className="font-medium">{entry.totalHours.toFixed(2)}</td>
                <td>
                  <Input
                    type="text"
                    value={entry.remarks}
                    onChange={(e) =>
                      updateEntry(entry.id, "remarks", e.target.value)
                    }
                    placeholder="Add remarks"
                    className="w-full"
                    readOnly={readOnly || entry.status !== "draft"}
                  />
                </td>
                <td>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    entry.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="p-4 border-t border-gray-200 text-right">
          <Button onClick={handleSave} className="bg-timetrack-blue hover:bg-blue-600">
            Save & Submit Timesheet
          </Button>
        </div>
      )}
    </div>
  );
};
