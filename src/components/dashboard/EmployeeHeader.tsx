
import { useState, useEffect } from "react";
import { Employee } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "./EditProfileModal";
import { toast } from "sonner";
import { Edit } from "lucide-react";

interface EmployeeHeaderProps {
  employee: Employee;
}

export const EmployeeHeader = ({ employee }: EmployeeHeaderProps) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employee);
  
  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleUpdateProfile = (updatedData: Employee) => {
    setCurrentEmployee(updatedData);
    
    // Update in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Also update employees list if exists
      const employees = localStorage.getItem("employees");
      if (employees) {
        const employeesList = JSON.parse(employees);
        const updatedEmployees = employeesList.map((emp: any) => 
          emp.id === updatedData.id ? { ...emp, ...updatedData } : emp
        );
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      }
      
      toast.success("Profile updated successfully");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-blue-100">
            {currentEmployee.avatar ? (
              <img src={currentEmployee.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                {currentEmployee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{currentEmployee.name}</h1>
            <div className="text-gray-600">
              {currentEmployee.position} • {currentEmployee.department}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap gap-3 text-sm mt-2 md:mt-0">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              ID: {currentEmployee.id.substring(0, 8)}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Status: {currentEmployee.status}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              Joined: {format(new Date(currentEmployee.joinDate), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
        
        <div className="text-right mt-4 md:mt-0 flex flex-col items-end">
          <div className="text-3xl font-bold text-gray-800">
            {format(currentDateTime, 'hh:mm:ss a')}
          </div>
          <div className="text-gray-600">
            {format(currentDateTime, 'EEEE, dd MMMM yyyy')}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        </div>
      </div>
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={currentEmployee}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};
