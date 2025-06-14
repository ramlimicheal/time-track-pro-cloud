
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TimesheetEntry, Timesheet } from "@/types";
import { format } from "date-fns";
import { dataSyncManager } from "@/utils/dataSync";
import { calculateTotalHours } from "@/utils/timeUtils";

interface QuickTimesheetEntryProps {
  employeeId: string;
  onSuccess: () => void;
}

export const QuickTimesheetEntry = ({ employeeId, onSuccess }: QuickTimesheetEntryProps) => {
  const today = new Date();
  const [formData, setFormData] = useState({
    date: format(today, "yyyy-MM-dd"),
    workStart: "09:00",
    workEnd: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    otStart: "",
    otEnd: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workStart || !formData.workEnd || !formData.description) {
      toast.error("Please fill in work start time, end time, and description");
      return;
    }

    const totalHours = calculateTotalHours(
      formData.workStart,
      formData.workEnd,
      formData.breakStart,
      formData.breakEnd,
      formData.otStart,
      formData.otEnd
    );

    const entry: TimesheetEntry = {
      id: `entry-${Date.now()}`,
      date: format(new Date(formData.date), "dd-MMM-yyyy"),
      workStart: formData.workStart,
      workEnd: formData.workEnd,
      breakStart: formData.breakStart,
      breakEnd: formData.breakEnd,
      otStart: formData.otStart,
      otEnd: formData.otEnd,
      description: formData.description,
      remarks: "",
      totalHours,
      status: "pending"
    };

    // Get or create timesheet for the month
    const entryDate = new Date(formData.date);
    const month = entryDate.getMonth() + 1;
    const year = entryDate.getFullYear();
    const timesheetKey = `timesheet-${month}-${year}-${employeeId}`;
    
    let timesheet = localStorage.getItem(timesheetKey);
    let timesheetData: Timesheet;

    if (timesheet) {
      timesheetData = JSON.parse(timesheet);
      // Update or add entry
      const existingEntryIndex = timesheetData.entries.findIndex(e => e.date === entry.date);
      if (existingEntryIndex >= 0) {
        timesheetData.entries[existingEntryIndex] = entry;
      } else {
        timesheetData.entries.push(entry);
      }
    } else {
      // Create new timesheet
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : { id: employeeId, name: "Employee" };
      
      timesheetData = {
        id: `${employeeId}-${month}-${year}`,
        employeeId,
        employeeName: user.name,
        month,
        year,
        entries: [entry],
        status: "pending"
      };
    }

    timesheetData.status = "pending";
    dataSyncManager.submitTimesheet(timesheetData);
    
    toast.success(`Time entry for ${format(entryDate, "dd MMM yyyy")} submitted successfully`);
    onSuccess();
  };

  const totalHours = calculateTotalHours(
    formData.workStart,
    formData.workEnd,
    formData.breakStart,
    formData.breakEnd,
    formData.otStart,
    formData.otEnd
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="workStart">Work Start</Label>
          <Input
            type="time"
            id="workStart"
            name="workStart"
            value={formData.workStart}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="workEnd">Work End</Label>
          <Input
            type="time"
            id="workEnd"
            name="workEnd"
            value={formData.workEnd}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="breakStart">Break Start</Label>
          <Input
            type="time"
            id="breakStart"
            name="breakStart"
            value={formData.breakStart}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="breakEnd">Break End</Label>
          <Input
            type="time"
            id="breakEnd"
            name="breakEnd"
            value={formData.breakEnd}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      {formData.otStart && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="otStart">Overtime Start</Label>
            <Input
              type="time"
              id="otStart"
              name="otStart"
              value={formData.otStart}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="otEnd">Overtime End</Label>
            <Input
              type="time"
              id="otEnd"
              name="otEnd"
              value={formData.otEnd}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="description">Work Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your work activities..."
          required
        />
      </div>
      
      <div className="text-sm text-gray-600">
        Total Hours: <span className="font-semibold">{totalHours.toFixed(2)}h</span>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Entry
        </Button>
      </div>
    </form>
  );
};
