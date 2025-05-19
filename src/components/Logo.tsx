
import { Clock } from "lucide-react";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-timetrack-blue text-white">
        <Clock size={18} />
      </div>
      <span className="font-bold text-xl text-gray-800">TimeTrack Pro</span>
    </div>
  );
};
