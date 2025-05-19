
import { TimeIcon } from "@/components/TimeIcon";

export const TimesheetTableHeader = () => {
  return (
    <thead>
      <tr className="bg-timetrack-lightBlue text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
        <th className="px-3 py-3 text-left">Date</th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>Work Start</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>Break Start</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>Break End</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>Work End</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">Description</th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>OT Start</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">
          <div className="flex items-center gap-1">
            <span>OT End</span>
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-3 text-left">Total Hours</th>
        <th className="px-3 py-3 text-left">Remarks</th>
        <th className="px-3 py-3 text-left">Status</th>
      </tr>
    </thead>
  );
};
