
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
          className={`w-full justify-start text-left font-normal ${error ? "border-red-500" : ""}`}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatDisplayTime(value) : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="grid p-2">
          <div className="flex items-center justify-between mb-2 p-2 border-b">
            <div className="font-medium">Hours</div>
            <div className="font-medium">Minutes</div>
            <div className="font-medium">Period</div>
          </div>
          <div className="flex justify-between">
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
              {hours.map((hour) => (
                <div key={`hour-${hour}`} className="p-1">
                  {minutes.map((minute) => (
                    <React.Fragment key={`${hour}-${minute}`}>
                      {periods.map((period) => (
                        <Button 
                          key={`${hour}-${minute}-${period}`}
                          variant="ghost" 
                          className="w-full mb-1 text-xs"
                          onClick={() => handleTimeSelection(hour, minute, period)}
                        >
                          {hour}:{minute} {period}
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
