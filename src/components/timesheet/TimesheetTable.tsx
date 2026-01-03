import { useState, useEffect, useCallback } from "react";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";
import { calculateTotalHours, validateEntry } from "@/utils/timeUtils";
import { TimesheetTableHeader } from "./TimesheetTableHeader";
import { TimesheetBody } from "./TimesheetBody";
import { TimesheetActions } from "./TimesheetActions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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
  selectedDate?: Date;
  isDateSpecific?: boolean;
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
  selectedDate,
  isDateSpecific = false,
}) => {
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(entries);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Update entry and recalculate hours
  const updateEntry = useCallback((
    id: string,
    field: keyof TimesheetEntry,
    value: string | number
  ) => {
    setLocalEntries((currentEntries) => {
      return currentEntries.map((entry) => {
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
    });
  }, []);

  const handleBulkApprove = () => {
    if (selectedEntries.length === 0) {
      toast.error("Please select entries to approve");
      return;
    }
    
    selectedEntries.forEach(entryId => {
      if (onApproveEntry) onApproveEntry(entryId);
    });
    
    toast.success(`${selectedEntries.length} entries approved`);
    setSelectedEntries([]);
    setBulkSelectMode(false);
  };

  const handleBulkReject = () => {
    if (selectedEntries.length === 0) {
      toast.error("Please select entries to reject");
      return;
    }
    
    selectedEntries.forEach(entryId => {
      if (onRejectEntry) onRejectEntry(entryId);
    });
    
    toast.success(`${selectedEntries.length} entries rejected`);
    setSelectedEntries([]);
    setBulkSelectMode(false);
  };

  const toggleEntrySelection = useCallback((entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  }, []);

  const selectAllEntries = () => {
    setSelectedEntries(localEntries.map(entry => entry.id));
  };

  const clearSelection = () => {
    setSelectedEntries([]);
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
      
      if (isDateSpecific) {
        const dateStr = selectedDate ? format(selectedDate, "dd MMM") : "selected date";
        toast.success(`Timesheet for ${dateStr} saved and submitted for approval`);
      } else {
        toast.success("Timesheet saved successfully and submitted for approval");
      }
    }
  };

  const getTableTitle = () => {
    if (isDateSpecific && selectedDate) {
      return `Entry for ${format(selectedDate, "dd MMM yyyy")}`;
    }
    return `Timesheet for ${month} ${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="p-3 bg-timetrack-lightBlue border-b border-gray-200 print:bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-800">
            {getTableTitle()}
          </h2>
          
          {(onApproveEntry || onRejectEntry) && (
            <div className="flex items-center gap-2">
              {bulkSelectMode && (
                <>
                  <div className="text-sm text-gray-600">
                    {selectedEntries.length} selected
                  </div>
                  <Button size="sm" onClick={selectAllEntries} variant="outline" className="h-8 text-xs">
                    Select All
                  </Button>
                  <Button size="sm" onClick={clearSelection} variant="outline" className="h-8 text-xs">
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve Selected
                  </Button>
                  <Button size="sm" onClick={handleBulkReject} variant="destructive" className="h-8 text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject Selected
                  </Button>
                </>
              )}
              <Button 
                size="sm" 
                onClick={() => setBulkSelectMode(!bulkSelectMode)}
                variant={bulkSelectMode ? "default" : "outline"}
                className="h-8 text-xs"
              >
                {bulkSelectMode ? "Exit Bulk Mode" : "Bulk Actions"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {timesheetStatus === "approved" && (
        <Alert className="m-3 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Timesheet Approved</AlertTitle>
          <AlertDescription className="text-green-600">
            This timesheet has been reviewed and approved by management.
          </AlertDescription>
        </Alert>
      )}

      {timesheetStatus === "rejected" && (
        <Alert className="m-3 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-700">Timesheet Rejected</AlertTitle>
          <AlertDescription className="text-red-600">
            This timesheet has been reviewed and requires changes. Please contact your manager.
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full timesheet-table text-sm">
          <TimesheetTableHeader showActions={Boolean(onApproveEntry || onRejectEntry)} showBulkSelect={bulkSelectMode} />
          <TimesheetBody 
            entries={localEntries} 
            readOnly={readOnly} 
            onUpdate={updateEntry}
            onApproveEntry={onApproveEntry}
            onRejectEntry={onRejectEntry}
            bulkSelectMode={bulkSelectMode}
            selectedEntries={selectedEntries}
            onToggleSelection={toggleEntrySelection}
          />
        </table>
      </div>

      <TimesheetActions 
        readOnly={readOnly} 
        onSave={handleSave} 
        entries={localEntries}
        timesheetStatus={timesheetStatus}
        onGeneratePDF={onGeneratePDF}
        isDateSpecific={isDateSpecific}
      />
    </div>
  );
};
