
import { Input } from "@/components/ui/input";
import { TimePickerInput } from "./TimePickerInput";
import { TimesheetEntry } from "@/types";
import { isValidTimeFormat } from "@/utils/timeUtils";

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
  return <tr>
      <td className="whitespace-nowrap px-[12px]">{entry.date}</td>
      <td>
        <TimePickerInput 
          value={entry.workStart} 
          onChange={(value) => onUpdate(entry.id, "workStart", value)} 
          error={!isValidTimeFormat(entry.workStart) && entry.workStart ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <TimePickerInput 
          value={entry.breakStart} 
          onChange={(value) => onUpdate(entry.id, "breakStart", value)} 
          error={!isValidTimeFormat(entry.breakStart) && entry.breakStart ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <TimePickerInput 
          value={entry.breakEnd} 
          onChange={(value) => onUpdate(entry.id, "breakEnd", value)} 
          error={!isValidTimeFormat(entry.breakEnd) && entry.breakEnd ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <TimePickerInput 
          value={entry.workEnd} 
          onChange={(value) => onUpdate(entry.id, "workEnd", value)} 
          error={!isValidTimeFormat(entry.workEnd) && entry.workEnd ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input type="text" value={entry.description} onChange={e => onUpdate(entry.id, "description", e.target.value)} placeholder="Enter description" className="w-full" readOnly={readOnly || entry.status !== "draft"} />
      </td>
      <td>
        <TimePickerInput 
          value={entry.otStart} 
          onChange={(value) => onUpdate(entry.id, "otStart", value)} 
          error={!isValidTimeFormat(entry.otStart) && entry.otStart ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <TimePickerInput 
          value={entry.otEnd} 
          onChange={(value) => onUpdate(entry.id, "otEnd", value)} 
          error={!isValidTimeFormat(entry.otEnd) && entry.otEnd ? true : false}
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td className="font-medium">{entry.totalHours.toFixed(2)}</td>
      <td>
        <Input type="text" value={entry.remarks} onChange={e => onUpdate(entry.id, "remarks", e.target.value)} placeholder="Add remarks" className="w-full" readOnly={readOnly || entry.status !== "draft"} />
      </td>
      <td>
        <span className={`px-2 py-1 text-xs rounded-full ${entry.status === 'approved' ? 'bg-green-100 text-green-800' : entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : entry.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
        </span>
      </td>
    </tr>;
};
