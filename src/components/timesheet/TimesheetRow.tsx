
import { Input } from "@/components/ui/input";
import { TimePickerInput } from "./TimePickerInput";
import { TimesheetEntry } from "@/types";
import { isValidTimeFormat } from "@/utils/timeUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle } from "lucide-react";

interface TimesheetRowProps {
  entry: TimesheetEntry;
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
}

export const TimesheetRow = ({
  entry,
  readOnly,
  onUpdate
}: TimesheetRowProps) => {
  // Calculate the hours worked for this entry to show in Admin review
  const calculateDisplayHours = () => {
    if (entry.totalHours <= 0) {
      return "0.00";
    }
    return entry.totalHours.toFixed(2);
  };

  // Determine if there's overtime for this entry
  const hasOvertime = entry.otStart && entry.otEnd;

  // Determine if the entry is editable (draft status and not readOnly)
  const isEditable = !readOnly && entry.status === "draft";
  
  // Determine background color based on status
  const getRowBackgroundColor = () => {
    switch (entry.status) {
      case 'approved': return 'bg-green-50';
      case 'pending': return 'bg-yellow-50';
      case 'rejected': return 'bg-red-50';
      default: return '';
    }
  };

  return (
    <tr className={`${getRowBackgroundColor()} hover:bg-gray-50 transition-colors`}>
      <td className="whitespace-nowrap px-[12px] py-3 font-medium">{entry.date}</td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.workStart} 
          onChange={(value) => onUpdate(entry.id, "workStart", value)} 
          error={!isValidTimeFormat(entry.workStart) && entry.workStart ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.breakStart} 
          onChange={(value) => onUpdate(entry.id, "breakStart", value)} 
          error={!isValidTimeFormat(entry.breakStart) && entry.breakStart ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.breakEnd} 
          onChange={(value) => onUpdate(entry.id, "breakEnd", value)} 
          error={!isValidTimeFormat(entry.breakEnd) && entry.breakEnd ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.workEnd} 
          onChange={(value) => onUpdate(entry.id, "workEnd", value)} 
          error={!isValidTimeFormat(entry.workEnd) && entry.workEnd ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="px-2 py-2">
        <Input 
          type="text" 
          value={entry.description} 
          onChange={e => onUpdate(entry.id, "description", e.target.value)} 
          placeholder="Enter description" 
          className="w-full" 
          readOnly={!isEditable} 
        />
      </td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.otStart} 
          onChange={(value) => onUpdate(entry.id, "otStart", value)} 
          error={!isValidTimeFormat(entry.otStart) && entry.otStart ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="px-2 py-2">
        <TimePickerInput 
          value={entry.otEnd} 
          onChange={(value) => onUpdate(entry.id, "otEnd", value)} 
          error={!isValidTimeFormat(entry.otEnd) && entry.otEnd ? true : false}
          readOnly={!isEditable}
        />
      </td>
      <td className="font-medium px-2 py-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center ${hasOvertime ? 'text-blue-600 font-semibold' : ''}`}>
                {calculateDisplayHours()}
                {hasOvertime && <CheckCircle size={14} className="ml-1 text-blue-600" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-white p-2 shadow-lg">
              {hasOvertime 
                ? `Regular hours: ${(entry.totalHours - 1).toFixed(2)}, Overtime: 1.00`
                : `Regular working hours`
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-2 py-2">
        <Input 
          type="text" 
          value={entry.remarks} 
          onChange={e => onUpdate(entry.id, "remarks", e.target.value)} 
          placeholder="Add remarks" 
          className="w-full" 
          readOnly={!isEditable} 
        />
      </td>
      <td className="px-2 py-2">
        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
          entry.status === 'approved' ? 'bg-green-100 text-green-800' : 
          entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          entry.status === 'rejected' ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
        </span>
      </td>
    </tr>
  );
};
