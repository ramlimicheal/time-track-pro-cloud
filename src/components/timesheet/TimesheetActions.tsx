
import { Button } from "@/components/ui/button";
import { FileText, Printer, Save } from "lucide-react";
import { TimesheetEntry } from "@/types";

interface TimesheetActionsProps {
  readOnly: boolean;
  onSave: () => void;
  entries?: TimesheetEntry[];
  timesheetStatus?: "draft" | "pending" | "approved" | "rejected";
  onGeneratePDF?: () => void;
  isDateSpecific?: boolean;
}

export const TimesheetActions = ({ 
  readOnly, 
  onSave, 
  entries = [], 
  timesheetStatus,
  onGeneratePDF,
  isDateSpecific = false
}: TimesheetActionsProps) => {
  // Function to handle printing the timesheet
  const handlePrint = () => {
    window.print();
  };

  // Check if there's at least one entry with data
  const hasEntries = entries.some(entry => 
    entry.workStart || entry.workEnd || entry.description
  );

  return (
    <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 print:hidden">
      {readOnly && (timesheetStatus === "approved" || timesheetStatus === "rejected") && (
        <>
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-gray-100 border-gray-300"
          >
            <Printer className="h-4 w-4" />
            Print Timesheet
          </Button>
          {onGeneratePDF && (
            <Button 
              onClick={onGeneratePDF}
              variant="outline"
              className="flex items-center gap-2 hover:bg-timetrack-lightBlue border-timetrack-blue text-timetrack-blue"
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          )}
        </>
      )}
      
      {!readOnly && (
        <Button 
          onClick={onSave} 
          className="bg-timetrack-blue hover:bg-blue-600 shadow-sm transition-all"
          disabled={!hasEntries}
        >
          <Save className="h-4 w-4 mr-2" />
          {isDateSpecific 
            ? "Submit Entry for Approval" 
            : "Save & Submit Timesheet"}
        </Button>
      )}
    </div>
  );
};
