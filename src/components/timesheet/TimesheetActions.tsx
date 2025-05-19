
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TimesheetEntry } from "@/types";

interface TimesheetActionsProps {
  readOnly: boolean;
  onSave: () => void;
  entries?: TimesheetEntry[];
  timesheetStatus?: "draft" | "pending" | "approved" | "rejected";
}

export const TimesheetActions = ({ 
  readOnly, 
  onSave, 
  entries = [], 
  timesheetStatus 
}: TimesheetActionsProps) => {
  // Function to handle printing the timesheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 border-t border-gray-200 text-right flex justify-end gap-3">
      {readOnly && timesheetStatus === "approved" && (
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          className="print:hidden flex items-center gap-2 hover:bg-slate-100"
        >
          <Printer className="h-4 w-4" />
          Print Timesheet
        </Button>
      )}
      
      {!readOnly && (
        <Button onClick={onSave} className="bg-timetrack-blue hover:bg-blue-600">
          Save & Submit Timesheet
        </Button>
      )}
    </div>
  );
};
