
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck, CalendarX } from "lucide-react";
import { FormField } from "@/components/admin/FormField";

interface LeaveApplicationFormProps {
  employeeId: string;
}

export const LeaveApplicationForm = ({ employeeId }: LeaveApplicationFormProps) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "annual",
    reason: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    // In a real app, this would be sent to an API
    const leaveApplication = {
      id: `leave-${Date.now()}`,
      employeeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      leaveType: formData.leaveType,
      reason: formData.reason,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // Save to localStorage for persistence
    const existingLeaves = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    localStorage.setItem("leaveApplications", JSON.stringify([...existingLeaves, leaveApplication]));

    toast.success("Leave application submitted successfully");
    
    // Reset form
    setFormData({
      startDate: "",
      endDate: "",
      leaveType: "annual",
      reason: ""
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Start Date"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          type="date"
          required
          icon={Calendar}
        />
        
        <FormField
          label="End Date"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
          type="date"
          required
          icon={Calendar}
        />
        
        <FormField
          label="Leave Type"
          name="leaveType"
          value={formData.leaveType}
          type="select"
          options={["annual", "sick", "personal", "other"]}
          onSelectChange={handleSelectChange}
          required
        />
        
        <FormField
          label="Reason"
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          type="textarea"
          placeholder="Please explain your reason for leave"
          required
        />
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
};
