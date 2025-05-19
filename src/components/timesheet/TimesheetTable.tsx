
import { useState, useEffect } from "react";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";
import { calculateTotalHours, validateEntry } from "@/utils/timeUtils";
import { TimesheetTableHeader } from "./TimesheetTableHeader";
import { TimesheetBody } from "./TimesheetBody";
import { TimesheetActions } from "./TimesheetActions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle } from "lucide-react";

interface TimesheetTableProps {
  month: string;
  year: number;
  entries: TimesheetEntry[];
  onSave?: (entries: TimesheetEntry[]) => void;
  readOnly?: boolean;
  timesheetStatus?: "draft" | "pending" | "approved" | "rejected";
  onGeneratePDF?: () => void;
  onApproveEntry?: (entryId: string) => void;
  onRejectEntry?: (entryId: string) => void;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  month,
  year,
  entries,
  onSave,
  readOnly = false,
  timesheetStatus,
  onGeneratePDF,
  onApproveEntry,
  onRejectEntry,
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5 bg-timetrack-lightBlue border-b border-gray-200 print:bg-white">
        <h2 className="text-lg font-medium text-gray-800 text-center">
          Timesheet for {month} {year}
        </h2>
      </div>

      {timesheetStatus === "approved" && (
        <Alert className="m-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Timesheet Approved</AlertTitle>
          <AlertDescription className="text-green-600">
            This timesheet has been reviewed and approved by management.
          </AlertDescription>
        </Alert>
      )}

      {timesheetStatus === "rejected" && (
        <Alert className="m-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-700">Timesheet Rejected</AlertTitle>
          <AlertDescription className="text-red-600">
            This timesheet has been reviewed and requires changes. Please contact your manager.
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full timesheet-table text-sm">
          <TimesheetTableHeader showActions={Boolean(onApproveEntry || onRejectEntry)} />
          <TimesheetBody 
            entries={localEntries} 
            readOnly={readOnly} 
            onUpdate={updateEntry}
            onApproveEntry={onApproveEntry}
            onRejectEntry={onRejectEntry}
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
