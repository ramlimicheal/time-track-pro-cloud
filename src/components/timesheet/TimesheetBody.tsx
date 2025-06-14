import { TimesheetEntry } from "@/types";
import { TimesheetRow } from "./TimesheetRow";
import { Checkbox } from "@/components/ui/checkbox";

interface TimesheetBodyProps {
  entries: TimesheetEntry[];
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
  onApproveEntry?: (entryId: string) => void;
  onRejectEntry?: (entryId: string) => void;
  isDateSpecific?: boolean;
  bulkSelectMode?: boolean;
  selectedEntries?: string[];
  onToggleSelection?: (entryId: string) => void;
}

export const TimesheetBody = ({ 
  entries, 
  readOnly, 
  onUpdate,
  onApproveEntry,
  onRejectEntry,
  isDateSpecific = false,
  bulkSelectMode = false,
  selectedEntries = [],
  onToggleSelection
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
          bulkSelectMode={bulkSelectMode}
          isSelected={selectedEntries.includes(entry.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
      
      {entries.length === 0 && (
        <tr className="bg-gray-50">
          <td colSpan={bulkSelectMode ? 13 : 12} className="px-6 py-8 text-center text-gray-500">
            {isDateSpecific 
              ? "No timesheet entry for this date. Please fill in your work hours." 
              : "No timesheet entries found for this period."}
          </td>
        </tr>
      )}
    </tbody>
  );
};
