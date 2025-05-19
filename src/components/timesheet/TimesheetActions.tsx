
import { Button } from "@/components/ui/button";

interface TimesheetActionsProps {
  readOnly: boolean;
  onSave: () => void;
}

export const TimesheetActions = ({ readOnly, onSave }: TimesheetActionsProps) => {
  if (readOnly) return null;
  
  return (
    <div className="p-4 border-t border-gray-200 text-right">
      <Button onClick={onSave} className="bg-timetrack-blue hover:bg-blue-600">
        Save & Submit Timesheet
      </Button>
    </div>
  );
};
