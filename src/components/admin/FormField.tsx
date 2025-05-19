
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "date" | "textarea" | "select" | "password";
  icon?: LucideIcon;
  options?: string[];
  onSelectChange?: (name: string, value: string) => void;
  className?: string;
}

export const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
  icon: Icon,
  options = [],
  onSelectChange,
  className = ""
}: FormFieldProps) => {
  // Validate that we have the appropriate handlers for each input type
  if (type === "select" && !onSelectChange) {
    console.warn(`FormField of type "select" is missing onSelectChange handler for field: ${name}`);
  }
  if (type !== "select" && !onChange) {
    console.warn(`FormField is missing onChange handler for field: ${name}`);
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 items-start gap-4 mb-4 ${className}`}>
      <div className="md:col-span-3 flex items-center text-sm py-2">
        {Icon && <Icon className="h-4 w-4 mr-2 text-gray-600" />}
        <label className="font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      </div>
      
      <div className="md:col-span-9">
        {type === "textarea" ? (
          <Textarea 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full min-h-[100px] resize-y border-gray-300 focus:border-timetrack-blue focus:ring-timetrack-blue/20" 
            placeholder={placeholder}
            rows={3}
          />
        ) : type === "select" && options.length > 0 && onSelectChange ? (
          <Select value={value} onValueChange={value => onSelectChange(name, value)}>
            <SelectTrigger className="w-full bg-white border-gray-300 focus:border-timetrack-blue">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full bg-white border-gray-300 focus:border-timetrack-blue focus:ring-timetrack-blue/20" 
            placeholder={placeholder} 
            type={type}
          />
        )}
        {type === "date" && !value && (
          <p className="text-xs text-gray-500 mt-1">Please select a date</p>
        )}
      </div>
    </div>
  );
};
