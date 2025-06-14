
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  compact?: boolean;
}

export const TimePickerInput = ({ value, onChange, error, readOnly, compact = false, ...props }: TimePickerInputProps) => {
  const hours = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  const minutes = ["00", "15", "30", "45"];
  const periods = ["AM", "PM"];
  
  const handleTimeSelection = (hour: number, minute: string, period: string) => {
    // Convert 12h format to 24h format for storage
    let hourIn24 = hour;
    if (period === "PM" && hour !== 12) hourIn24 += 12;
    if (period === "AM" && hour === 12) hourIn24 = 0;
    
    const formattedHour = hourIn24.toString().padStart(2, "0");
    const formattedTime = `${formattedHour}:${minute}`;
    onChange(formattedTime);
  };

  // Parse the current value to display in the button
  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return "";
    
    try {
      const [hour, minute] = timeString.split(":").map(Number);
      if (isNaN(hour) || isNaN(minute)) return timeString;
      
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    } catch (e) {
      return timeString;
    }
  };

  const buttonClasses = compact 
    ? "w-full justify-start text-left font-normal hover:bg-gray-50 h-8 text-sm px-2"
    : "w-full justify-start text-left font-normal hover:bg-gray-50";

  const iconClasses = compact ? "mr-1 h-3 w-3 text-gray-500" : "mr-2 h-4 w-4 text-gray-500";

  if (readOnly) {
    return (
      <Input 
        type="text" 
        value={formatDisplayTime(value)} 
        className={`time-input ${error ? "border-red-500" : ""} ${compact ? "h-8 text-sm" : ""}`}
        readOnly={true}
        {...props}
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`${buttonClasses} ${error ? "border-red-500 text-red-500" : ""}`}
          size={compact ? "sm" : "default"}
        >
          <Clock className={iconClasses} />
          {value ? formatDisplayTime(value) : "Set time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="grid p-1">
          <div className="flex items-center justify-between mb-3 p-1 border-b">
            <div className="font-medium text-gray-700 text-sm">Select Time</div>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">
            {hours.map((hour) => (
              React.createElement(React.Fragment, { key: `hour-${hour}` },
                minutes.map((minute) => (
                  periods.map((period) => (
                    <Button 
                      key={`${hour}-${minute}-${period}`}
                      variant="outline" 
                      className={`w-full text-xs hover:bg-timetrack-lightBlue hover:border-timetrack-blue h-8 ${
                        period === "AM" 
                          ? "bg-[#D3E4FD] hover:bg-[#C3D4ED]" 
                          : "bg-[#E5DEFF] hover:bg-[#D5CEEF]"
                      }`}
                      onClick={() => handleTimeSelection(hour, minute, period)}
                    >
                      {hour}:{minute} {period}
                    </Button>
                  ))
                ))
              )
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
