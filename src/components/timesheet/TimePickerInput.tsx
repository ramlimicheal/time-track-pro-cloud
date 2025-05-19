
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const TimePickerInput = ({ value, onChange, error, readOnly, ...props }: TimePickerInputProps) => {
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

  if (readOnly) {
    return (
      <Input 
        type="text" 
        value={formatDisplayTime(value)} 
        className={`time-input ${error ? "border-red-500" : ""}`}
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
          className={`w-full justify-start text-left font-normal hover:bg-gray-50 ${error ? "border-red-500 text-red-500" : ""}`}
          size="sm"
        >
          <Clock className="mr-2 h-4 w-4 text-gray-500" />
          {value ? formatDisplayTime(value) : "Click to set time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4" align="start">
        <div className="grid p-2">
          <div className="flex items-center justify-between mb-4 p-2 border-b">
            <div className="font-medium text-gray-700">Select Time</div>
          </div>
          <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
            {hours.map((hour) => (
              React.createElement(React.Fragment, { key: `hour-${hour}` },
                minutes.map((minute) => (
                  periods.map((period) => (
                    <Button 
                      key={`${hour}-${minute}-${period}`}
                      variant="outline" 
                      className={`w-full text-sm hover:bg-timetrack-lightBlue hover:border-timetrack-blue ${
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
