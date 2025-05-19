
import { TimesheetEntry } from "@/types";
import { TimesheetRow } from "./TimesheetRow";

interface TimesheetBodyProps {
  entries: TimesheetEntry[];
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
  onApproveEntry?: (entryId: string) => void;
  onRejectEntry?: (entryId: string) => void;
}

export const TimesheetBody = ({ 
  entries, 
  readOnly, 
  onUpdate,
  onApproveEntry,
  onRejectEntry 
}: TimesheetBodyProps) => {
  return (
    <tbody>
      {entries.map((entry) => (
        <TimesheetRow 
          key={entry.id} 
          entry={entry} 
          readOnly={readOnly} 
          onUpdate={onUpdate}
          onApproveEntry={onApproveEntry}
          onRejectEntry={onRejectEntry}
        />
      ))}
    </tbody>
  );
};
