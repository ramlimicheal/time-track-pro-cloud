
import { Button } from "@/components/ui/button";
import { FileText, Printer, FileText2 } from "lucide-react";
import { TimesheetEntry } from "@/types";

interface TimesheetActionsProps {
  readOnly: boolean;
  onSave: () => void;
  entries?: TimesheetEntry[];
  timesheetStatus?: "draft" | "pending" | "approved" | "rejected";
  onGeneratePDF?: () => void;
}

export const TimesheetActions = ({ 
  readOnly, 
  onSave, 
  entries = [], 
  timesheetStatus,
  onGeneratePDF
}: TimesheetActionsProps) => {
  // Function to handle printing the timesheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 border-t border-gray-200 text-right flex justify-end gap-3">
      {readOnly && timesheetStatus === "approved" && (
        <>
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            className="print:hidden flex items-center gap-2 hover:bg-slate-100"
          >
            <Printer className="h-4 w-4" />
            Print Timesheet
          </Button>
          {onGeneratePDF && (
            <Button 
              onClick={onGeneratePDF}
              variant="outline"
              className="print:hidden flex items-center gap-2 hover:bg-slate-100 bg-timetrack-lightBlue text-timetrack-blue"
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          )}
        </>
      )}
      
      {!readOnly && (
        <Button onClick={onSave} className="bg-timetrack-blue hover:bg-blue-600">
          <FileText className="h-4 w-4 mr-2" />
          Save & Submit Timesheet
        </Button>
      )}
    </div>
  );
};
