
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
  onSelectChange
}: FormFieldProps) => {
  // Validate that we have the appropriate handlers for each input type
  if (type === "select" && !onSelectChange) {
    console.warn(`FormField of type "select" is missing onSelectChange handler for field: ${name}`);
  }
  if (type !== "select" && !onChange) {
    console.warn(`FormField is missing onChange handler for field: ${name}`);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 items-center gap-4">
      <div className="md:col-span-1 flex items-center justify-end text-sm">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        <label className="whitespace-nowrap">{label}{required && " *"}</label>
      </div>
      
      {type === "textarea" ? (
        <Textarea 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="md:col-span-5" 
          placeholder={placeholder} 
          rows={3}
        />
      ) : type === "select" && options.length > 0 && onSelectChange ? (
        <div className="md:col-span-5">
          <Select value={value} onValueChange={value => onSelectChange(name, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Input 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="md:col-span-5" 
          placeholder={placeholder} 
          type={type} 
        />
      )}
    </div>
  );
};
