
import { TimesheetEntry } from "@/types";
import { TimePickerInput } from "./TimePickerInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { memo } from "react";

interface TimesheetRowProps {
  entry: TimesheetEntry;
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
  onApproveEntry?: (entryId: string) => void;
  onRejectEntry?: (entryId: string) => void;
  isDateSpecific?: boolean;
  bulkSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (entryId: string) => void;
}

export const TimesheetRow = memo(({
  entry, 
  readOnly, 
  onUpdate,
  onApproveEntry,
  onRejectEntry,
  isDateSpecific = false,
  bulkSelectMode = false,
  isSelected = false,
  onToggleSelection
}: TimesheetRowProps) => {
  const calculateTotalHours = () => {
    if (!entry.workStart || !entry.workEnd) return 0;
    
    const workStart = new Date(`2000-01-01 ${entry.workStart}`);
    const workEnd = new Date(`2000-01-01 ${entry.workEnd}`);
    let totalMinutes = (workEnd.getTime() - workStart.getTime()) / (1000 * 60);
    
    // Subtract break time
    if (entry.breakStart && entry.breakEnd) {
      const breakStart = new Date(`2000-01-01 ${entry.breakStart}`);
      const breakEnd = new Date(`2000-01-01 ${entry.breakEnd}`);
      const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      totalMinutes -= breakMinutes;
    }
    
    // Add overtime
    if (entry.otStart && entry.otEnd) {
      const overtimeStart = new Date(`2000-01-01 ${entry.otStart}`);
      const overtimeEnd = new Date(`2000-01-01 ${entry.otEnd}`);
      const overtimeMinutes = (overtimeEnd.getTime() - overtimeStart.getTime()) / (1000 * 60);
      totalMinutes += overtimeMinutes;
    }
    
    return Math.max(0, totalMinutes / 60);
  };

  const totalHours = calculateTotalHours();

  return (
    <tr className={`${isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
      {bulkSelectMode && (
        <td className="px-2 py-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection?.(entry.id)}
            className="h-4 w-4"
          />
        </td>
      )}
      <td className="px-2 py-1">
        <input
          type="date"
          value={entry.date}
          onChange={(e) => onUpdate(entry.id, "date", e.target.value)}
          className="w-full p-1.5 border rounded text-sm h-8"
          disabled={readOnly}
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.workStart}
          onChange={(value) => onUpdate(entry.id, "workStart", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.workEnd}
          onChange={(value) => onUpdate(entry.id, "workEnd", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.breakStart}
          onChange={(value) => onUpdate(entry.id, "breakStart", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.breakEnd}
          onChange={(value) => onUpdate(entry.id, "breakEnd", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.otStart}
          onChange={(value) => onUpdate(entry.id, "otStart", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <TimePickerInput
          value={entry.otEnd}
          onChange={(value) => onUpdate(entry.id, "otEnd", value)}
          disabled={readOnly}
          compact
        />
      </td>
      <td className="px-2 py-1">
        <Textarea
          value={entry.description}
          onChange={(e) => onUpdate(entry.id, "description", e.target.value)}
          placeholder="Work description..."
          className="min-h-[40px] text-sm resize-none"
          disabled={readOnly}
        />
      </td>
      <td className="px-2 py-1 text-center font-medium text-sm">
        {totalHours.toFixed(2)}h
      </td>
      <td className="px-2 py-1">
        <Badge 
          variant={
            entry.status === "approved" ? "default" : 
            entry.status === "rejected" ? "destructive" : 
            "secondary"
          }
          className="text-xs px-2 py-0.5"
        >
          {entry.status}
        </Badge>
      </td>
      {(onApproveEntry || onRejectEntry) && (
        <td className="px-2 py-1">
          <div className="flex gap-1">
            {onApproveEntry && entry.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApproveEntry(entry.id)}
                className="text-green-600 hover:text-green-700 h-7 w-7 p-0"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            {onRejectEntry && entry.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRejectEntry(entry.id)}
                className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

TimesheetRow.displayName = "TimesheetRow";
