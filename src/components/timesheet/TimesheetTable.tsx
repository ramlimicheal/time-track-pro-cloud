import { useState, useEffect } from "react";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";
import { calculateTotalHours, validateEntry } from "@/utils/timeUtils";
import { TimesheetTableHeader } from "./TimesheetTableHeader";
import { TimesheetBody } from "./TimesheetBody";
import { TimesheetActions } from "./TimesheetActions";

interface TimesheetTableProps {
  month: string;
  year: number;
  entries: TimesheetEntry[];
  onSave?: (entries: TimesheetEntry[]) => void;
  readOnly?: boolean;
  timesheetStatus?: "draft" | "pending" | "approved" | "rejected";
  onGeneratePDF?: () => void;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  month,
  year,
  entries,
  onSave,
  readOnly = false,
  timesheetStatus,
  onGeneratePDF,
}) => {
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(entries);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

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
          updatedEntry.totalHours = calculateTotalHours(
            updatedEntry.workStart,
            updatedEntry.workEnd,
            updatedEntry.breakStart,
            updatedEntry.breakEnd,
            updatedEntry.otStart,
            updatedEntry.otEnd
          );
        }

        return updatedEntry;
      }
      return entry;
    });
    setLocalEntries(updatedEntries);
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="p-4 bg-timetrack-lightBlue border-b border-gray-200 print:bg-white">
        <h2 className="text-base font-medium text-gray-800 text-center">
          Timesheet for {month} {year}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full timesheet-table text-sm">
          <TimesheetTableHeader />
          <TimesheetBody 
            entries={localEntries} 
            readOnly={readOnly} 
            onUpdate={updateEntry} 
          />
        </table>
      </div>

      <TimesheetActions 
        readOnly={readOnly} 
        onSave={handleSave} 
        entries={localEntries}
        timesheetStatus={timesheetStatus}
        onGeneratePDF={onGeneratePDF}
      />
    </div>
  );
};
