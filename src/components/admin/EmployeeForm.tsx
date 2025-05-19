
import { useState, useEffect } from "react";
import { User, Calendar, Droplet, Phone, Home, Building, PhoneCall, Mail, Key } from "lucide-react";
import { Employee } from "@/types";
import { departments, bloodGroups, generateUsername, generatePassword } from "@/utils/employeeUtils";
import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";

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
      {/* Personal Information Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-1" />
          Personal Information
        </h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
              icon={User}
            />
            
            <FormField
              label="DOB"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              type="date"
              required
              icon={Calendar}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              type="select"
              options={bloodGroups}
              onSelectChange={handleSelectChange}
              icon={Droplet}
            />
            
            <FormField
              label="Passport No."
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleInputChange}
              placeholder="AB1234567"
              required
              icon={User}
            />
          </div>
        </div>
      </div>
      
      {/* Contact Information Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 flex items-center">
          <Phone className="h-4 w-4 mr-1" />
          Contact Information
        </h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+91 1234567890"
              required
              icon={Phone}
            />
            
            <FormField
              label="Emergency No."
              name="emergencyPhoneNumber"
              value={formData.emergencyPhoneNumber}
              onChange={handleInputChange}
              placeholder="+91 1234567890"
              required
              icon={PhoneCall}
            />
          </div>
          
          <FormField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            type="email"
            required
            icon={Mail}
          />
        </div>
      </div>
      
      {/* Address Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 flex items-center">
          <Home className="h-4 w-4 mr-1" />
          Address Information
        </h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <FormField
            label="Indian Address"
            name="indianAddress"
            value={formData.indianAddress}
            onChange={handleInputChange}
            placeholder="Full address in India"
            type="textarea"
            required
            icon={Home}
          />
          
          <FormField
            label="Oman Address"
            name="omanAddress"
            value={formData.omanAddress}
            onChange={handleInputChange}
            placeholder="Full address in Oman"
            type="textarea"
            required
            icon={Building}
          />
        </div>
      </div>
      
      {/* Employment Details Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 flex items-center">
          <Building className="h-4 w-4 mr-1" />
          Employment Details
        </h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Department"
              name="department"
              value={formData.department}
              type="select"
              options={departments}
              onSelectChange={handleSelectChange}
              required
            />
            
            <FormField
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Software Engineer"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Join Date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleInputChange}
              type="date"
              required
            />
            
            <FormField
              label="Status"
              name="status"
              value={formData.status}
              type="select"
              options={["active", "inactive", "onleave"]}
              onSelectChange={handleSelectChange}
            />
          </div>
        </div>
      </div>
      
      {/* Login Credentials Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 flex items-center">
          <Key className="h-4 w-4 mr-1" />
          Login Credentials
        </h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div className="text-sm font-medium">
              <label>Username</label>
            </div>
            <div className="sm:col-span-2">
              <Input 
                name="username" 
                value={mode === "add" ? (formData.username || generatedUsername) : formData.username} 
                onChange={handleInputChange} 
                className="w-full bg-gray-100 border-gray-300" 
                readOnly
              />
              {mode === "add" && <p className="text-xs text-gray-500 mt-1">Auto-generated username</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div className="text-sm font-medium">
              <label>Password</label>
            </div>
            <div className="sm:col-span-2">
              <Input 
                name="password" 
                value={mode === "add" ? (formData.password || generatedPassword) : formData.password} 
                onChange={handleInputChange} 
                className="w-full bg-gray-100 border-gray-300" 
                readOnly
              />
              {mode === "add" && <p className="text-xs text-gray-500 mt-1">Auto-generated password</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
