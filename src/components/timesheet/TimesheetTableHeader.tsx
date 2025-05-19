
interface TimesheetTableHeaderProps {
  showActions?: boolean;
  isDateSpecific?: boolean;
}

export const TimesheetTableHeader = ({ 
  showActions = false, 
  isDateSpecific = false 
}: TimesheetTableHeaderProps) => {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
      <tr>
        {!isDateSpecific && <th className="px-[12px] py-3">Date</th>}
        <th className="px-2 py-3">Start</th>
        <th className="px-2 py-3">Break Start</th>
        <th className="px-2 py-3">Break End</th>
        <th className="px-2 py-3">End</th>
        <th className="px-2 py-3">Description</th>
        <th className="px-2 py-3">OT Start</th>
        <th className="px-2 py-3">OT End</th>
        <th className="px-2 py-3">Hours</th>
        <th className="px-2 py-3">Remarks</th>
        <th className="px-2 py-3">Status</th>
        {showActions && <th className="px-2 py-3">Actions</th>}
      </tr>
    </thead>
  );
};
