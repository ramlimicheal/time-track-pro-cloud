
import { TimeIcon } from "@/components/TimeIcon";

export const TimesheetTableHeader = () => {
  return (
    <thead>
      <tr className="bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wider">
        <th className="px-3 py-2.5 text-left">Date</th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            Work Start
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            Break Start
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            Break End
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            Work End
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">Description</th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            OT Start
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">
          <div className="flex items-center gap-1">
            OT End
            <TimeIcon />
          </div>
        </th>
        <th className="px-3 py-2.5 text-left">Total Hours</th>
        <th className="px-3 py-2.5 text-left">Remarks</th>
        <th className="px-3 py-2.5 text-left">Status</th>
      </tr>
    </thead>
  );
};
