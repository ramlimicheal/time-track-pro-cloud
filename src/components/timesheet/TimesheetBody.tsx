
import { TimesheetEntry } from "@/types";
import { TimesheetRow } from "./TimesheetRow";

interface TimesheetBodyProps {
  entries: TimesheetEntry[];
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
  onApproveEntry?: (entryId: string) => void;
  onRejectEntry?: (entryId: string) => void;
  isDateSpecific?: boolean;
}

export const TimesheetBody = ({ 
  entries, 
  readOnly, 
  onUpdate,
  onApproveEntry,
  onRejectEntry,
  isDateSpecific = false
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
          isDateSpecific={isDateSpecific}
        />
      ))}
      
      {entries.length === 0 && (
        <tr className="bg-gray-50">
          <td colSpan={isDateSpecific ? 11 : 12} className="px-6 py-8 text-center text-gray-500">
            {isDateSpecific 
              ? "No timesheet entry for this date. Please fill in your work hours." 
              : "No timesheet entries found for this period."}
          </td>
        </tr>
      )}
    </tbody>
  );
};
