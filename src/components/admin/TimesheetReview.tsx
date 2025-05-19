
import { Button } from "@/components/ui/button";
import { FileText, Printer, Check, X, Clock } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface TimesheetReviewProps {
  employee: Employee | undefined;
  entries: TimesheetEntry[];
  timesheetStatus: "draft" | "pending" | "approved" | "rejected";
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
        
        {(timesheetStatus === "approved" || timesheetStatus === "rejected") && (
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
        <div className="mt-2">
          {timesheetStatus === "approved" && (
            <div className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <Check className="h-4 w-4 mr-1" />
              Approved
            </div>
          )}
          {timesheetStatus === "rejected" && (
            <div className="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              <X className="h-4 w-4 mr-1" />
              Rejected
            </div>
          )}
          {timesheetStatus === "pending" && (
            <div className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
              <Clock className="h-4 w-4 mr-1" />
              Pending Approval
            </div>
          )}
          {timesheetStatus === "draft" && (
            <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Draft
            </div>
          )}
        </div>
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
        {timesheetStatus === "pending" && (
          <>
            <Button variant="outline" onClick={onReject} className="flex items-center">
              <X className="h-4 w-4 mr-2" />
              Reject with Comments
            </Button>
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Approve Timesheet
            </Button>
          </>
        )}
      </div>
    </>
  );
};
