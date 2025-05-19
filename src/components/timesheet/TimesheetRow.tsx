
import { Input } from "@/components/ui/input";
import { TimesheetEntry } from "@/types";
import { isValidTimeFormat } from "@/utils/timeUtils";

interface TimesheetRowProps {
  entry: TimesheetEntry;
  readOnly: boolean;
  onUpdate: (id: string, field: keyof TimesheetEntry, value: string | number) => void;
}

export const TimesheetRow = ({ entry, readOnly, onUpdate }: TimesheetRowProps) => {
  return (
    <tr>
      <td className="whitespace-nowrap">{entry.date}</td>
      <td>
        <Input
          type="text"
          value={entry.workStart}
          onChange={(e) => onUpdate(entry.id, "workStart", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.workStart) && entry.workStart ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.breakStart}
          onChange={(e) => onUpdate(entry.id, "breakStart", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.breakStart) && entry.breakStart ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.breakEnd}
          onChange={(e) => onUpdate(entry.id, "breakEnd", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.breakEnd) && entry.breakEnd ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.workEnd}
          onChange={(e) => onUpdate(entry.id, "workEnd", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.workEnd) && entry.workEnd ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.description}
          onChange={(e) => onUpdate(entry.id, "description", e.target.value)}
          placeholder="Enter description"
          className="w-full"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.otStart}
          onChange={(e) => onUpdate(entry.id, "otStart", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.otStart) && entry.otStart ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <Input
          type="text"
          value={entry.otEnd}
          onChange={(e) => onUpdate(entry.id, "otEnd", e.target.value)}
          className={`time-input ${!isValidTimeFormat(entry.otEnd) && entry.otEnd ? "border-red-500" : ""}`}
          placeholder="HH:MM"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td className="font-medium">{entry.totalHours.toFixed(2)}</td>
      <td>
        <Input
          type="text"
          value={entry.remarks}
          onChange={(e) => onUpdate(entry.id, "remarks", e.target.value)}
          placeholder="Add remarks"
          className="w-full"
          readOnly={readOnly || entry.status !== "draft"}
        />
      </td>
      <td>
        <span className={`px-2 py-1 text-xs rounded-full ${
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
