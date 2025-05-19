
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface TimesheetReviewProps {
  employee: Employee | undefined;
  entries: TimesheetEntry[];
  timesheetStatus: "pending" | "approved" | "rejected";
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onGeneratePDF: () => void;
}

export const TimesheetReview = ({
  employee,
  entries,
  timesheetStatus,
  onBack,
  onApprove,
  onReject,
  onGeneratePDF,
}: TimesheetReviewProps) => {
  // Function to directly trigger printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
        
        {timesheetStatus === "approved" && (
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Timesheet
            </Button>
            <Button
              onClick={onGeneratePDF}
              variant="outline"
              className="flex items-center gap-2 bg-timetrack-lightBlue text-timetrack-blue hover:bg-blue-100"
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-4 print:hidden">
        <h2 className="text-xl font-semibold mb-2">
          {employee?.name} - May 2025 Timesheet
        </h2>
        <p className="text-gray-600">
          Department: {employee?.department}
        </p>
      </div>
      
      <TimesheetTable
        month="May"
        year={2025}
        entries={entries}
        readOnly={true}
        timesheetStatus={timesheetStatus}
        onGeneratePDF={onGeneratePDF}
      />
      
      <div className="mt-6 flex gap-4 justify-end print:hidden">
        <Button variant="outline" onClick={onReject}>
          Reject with Comments
        </Button>
        <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
          Approve Timesheet
        </Button>
      </div>
    </>
  );
};
