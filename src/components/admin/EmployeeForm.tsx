
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { User, Calendar, Droplet, Phone, Home, Building, PhoneCall, Mail, Key } from "lucide-react";
import { Employee } from "@/types";
import { departments, bloodGroups, generateUsername, generatePassword } from "@/utils/employeeUtils";

interface EmployeeFormProps {
  initialData?: Employee | null;
  formData: any;
  setFormData: (data: any) => void;
  generatedUsername: string;
  setGeneratedUsername: (username: string) => void;
  generatedPassword: string;
  setGeneratedPassword: (password: string) => void;
  mode: "add" | "edit";
}

export const EmployeeForm = ({
  initialData,
  formData,
  setFormData,
  generatedUsername,
  setGeneratedUsername,
  generatedPassword,
  setGeneratedPassword,
  mode
}: EmployeeFormProps) => {
  
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        department: initialData.department,
        position: initialData.position,
        joinDate: initialData.joinDate,
        status: initialData.status,
        dob: initialData.dob || "",
        bloodGroup: initialData.bloodGroup || "",
        passportNumber: initialData.passportNumber || "",
        phoneNumber: initialData.phoneNumber || "",
        indianAddress: initialData.indianAddress || "",
        omanAddress: initialData.omanAddress || "",
        emergencyPhoneNumber: initialData.emergencyPhoneNumber || "",
        username: initialData.username || "",
        password: initialData.password || ""
      });
    }
  }, [initialData, mode, setFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If name is being changed, generate a new username
    if (name === "name" && value && mode === "add") {
      const newUsername = generateUsername(value);
      const newPassword = generatePassword();
      setGeneratedUsername(newUsername);
      setGeneratedPassword(newPassword);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        username: newUsername,
        password: newPassword
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <User className="h-4 w-4 mr-2" />
          <label>Name*</label>
        </div>
        <Input 
          name="name" 
          value={formData.name} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="John Doe" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <label>DOB*</label>
        </div>
        <Input 
          name="dob" 
          value={formData.dob} 
          onChange={handleInputChange} 
          className="col-span-3" 
          type="date" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Droplet className="h-4 w-4 mr-2" />
          <label>Blood Group</label>
        </div>
        <Select 
          value={formData.bloodGroup} 
          onValueChange={(value) => handleSelectChange("bloodGroup", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            {bloodGroups.map(bg => (
              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <User className="h-4 w-4 mr-2" />
          <label>Passport No.*</label>
        </div>
        <Input 
          name="passportNumber" 
          value={formData.passportNumber} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="AB1234567" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Phone className="h-4 w-4 mr-2" />
          <label>Phone Number*</label>
        </div>
        <Input 
          name="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="+91 1234567890" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <div className="flex items-center justify-end text-sm pt-2">
          <Home className="h-4 w-4 mr-2" />
          <label>Indian Address*</label>
        </div>
        <Textarea 
          name="indianAddress" 
          value={formData.indianAddress} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="Full address in India" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <div className="flex items-center justify-end text-sm pt-2">
          <Building className="h-4 w-4 mr-2" />
          <label>Oman Address*</label>
        </div>
        <Textarea 
          name="omanAddress" 
          value={formData.omanAddress} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="Full address in Oman" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <PhoneCall className="h-4 w-4 mr-2" />
          <label>Emergency No.*</label>
        </div>
        <Input 
          name="emergencyPhoneNumber" 
          value={formData.emergencyPhoneNumber} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="+91 1234567890" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Mail className="h-4 w-4 mr-2" />
          <label>Email*</label>
        </div>
        <Input 
          name="email" 
          value={formData.email} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="john@example.com" 
          type="email"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm">Department*</label>
        <Select 
          value={formData.department} 
          onValueChange={(value) => handleSelectChange("department", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm">Position*</label>
        <Input 
          name="position" 
          value={formData.position} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder="Software Engineer" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm">Join Date</label>
        <Input 
          name="joinDate" 
          value={formData.joinDate} 
          onChange={handleInputChange} 
          className="col-span-3" 
          type="date" 
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm">Status</label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="onleave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Key className="h-4 w-4 mr-2" />
          <label>Username</label>
        </div>
        <div className="col-span-3">
          <Input 
            name="username" 
            value={mode === "add" ? (formData.username || generatedUsername) : formData.username} 
            onChange={handleInputChange} 
            className="w-full bg-gray-50" 
            readOnly
          />
          {mode === "add" && <p className="text-xs text-gray-500 mt-1">Auto-generated username</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-sm">
          <Key className="h-4 w-4 mr-2" />
          <label>Password</label>
        </div>
        <div className="col-span-3">
          <Input 
            name="password" 
            value={mode === "add" ? (formData.password || generatedPassword) : formData.password} 
            onChange={handleInputChange} 
            className="w-full bg-gray-50" 
            readOnly
          />
          {mode === "add" && <p className="text-xs text-gray-500 mt-1">Auto-generated password</p>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
