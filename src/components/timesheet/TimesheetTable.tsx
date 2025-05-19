
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimesheetEntry } from "@/types";

interface TimesheetTableProps {
  month: string;
  year: number;
  entries: TimesheetEntry[];
  onSave?: (entries: TimesheetEntry[]) => void;
  readOnly?: boolean;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  month,
  year,
  entries,
  onSave,
  readOnly = false,
}) => {
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(entries);

  const updateEntry = (
    id: string,
    field: keyof TimesheetEntry,
    value: string | number
  ) => {
    const updatedEntries = localEntries.map((entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          [field]: value,
        };
      }
      return entry;
    });
    setLocalEntries(updatedEntries);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localEntries);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 bg-timetrack-lightBlue border-b border-gray-200">
        <h2 className="text-xl font-semibold text-center">
          Timesheet for {month} {year}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full timesheet-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>WORK START</th>
              <th>BREAK START</th>
              <th>BREAK END</th>
              <th>WORK END</th>
              <th>DESCRIPTION</th>
              <th>OT START</th>
              <th>OT END</th>
              <th>TOTAL HOURS</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {localEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap">{entry.date}</td>
                <td>
                  <Input
                    type="text"
                    value={entry.workStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "workStart", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.breakStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "breakStart", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.breakEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "breakEnd", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.workEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "workEnd", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.description}
                    onChange={(e) =>
                      updateEntry(entry.id, "description", e.target.value)
                    }
                    placeholder="Enter description"
                    className="w-full"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.otStart}
                    onChange={(e) =>
                      updateEntry(entry.id, "otStart", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={entry.otEnd}
                    onChange={(e) =>
                      updateEntry(entry.id, "otEnd", e.target.value)
                    }
                    className="time-input"
                    placeholder="--:--"
                    readOnly={readOnly}
                  />
                </td>
                <td className="font-medium">{entry.totalHours.toFixed(2)}</td>
                <td>
                  <Input
                    type="text"
                    value={entry.remarks}
                    onChange={(e) =>
                      updateEntry(entry.id, "remarks", e.target.value)
                    }
                    placeholder="Add remarks"
                    className="w-full"
                    readOnly={readOnly}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="p-4 border-t border-gray-200 text-right">
          <Button onClick={handleSave} className="bg-timetrack-blue hover:bg-blue-600">
            Save Timesheet
          </Button>
        </div>
      )}
    </div>
  );
};
