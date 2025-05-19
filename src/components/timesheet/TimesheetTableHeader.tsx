
import { TimeIcon } from "@/components/TimeIcon";

export const TimesheetTableHeader = () => {
  return (
    <thead>
      <tr>
        <th>DATE</th>
        <th>
          <div className="flex items-center gap-1">
            WORK START
            <TimeIcon />
          </div>
        </th>
        <th>
          <div className="flex items-center gap-1">
            BREAK START
            <TimeIcon />
          </div>
        </th>
        <th>
          <div className="flex items-center gap-1">
            BREAK END
            <TimeIcon />
          </div>
        </th>
        <th>
          <div className="flex items-center gap-1">
            WORK END
            <TimeIcon />
          </div>
        </th>
        <th>DESCRIPTION</th>
        <th>
          <div className="flex items-center gap-1">
            OT START
            <TimeIcon />
          </div>
        </th>
        <th>
          <div className="flex items-center gap-1">
            OT END
            <TimeIcon />
          </div>
        </th>
        <th>TOTAL HOURS</th>
        <th>REMARKS</th>
        <th>STATUS</th>
      </tr>
    </thead>
  );
};
