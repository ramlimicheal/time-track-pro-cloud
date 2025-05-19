
import { useState, useEffect } from "react";
import { Employee } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface EmployeeHeaderProps {
  employee: Employee;
}

export const EmployeeHeader = ({ employee }: EmployeeHeaderProps) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-blue-100">
            <AvatarFallback className="bg-blue-500 text-white text-2xl">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <div className="text-gray-600">
              {employee.position} • {employee.department}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap gap-3 text-sm mt-2 md:mt-0">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              ID: {employee.id.substring(0, 8)}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Status: {employee.status}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              Joined: {format(new Date(employee.joinDate), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
        
        <div className="text-right mt-4 md:mt-0">
          <div className="text-3xl font-bold text-gray-800">
            {format(currentDateTime, 'hh:mm:ss a')}
          </div>
          <div className="text-gray-600">
            {format(currentDateTime, 'EEEE, dd MMMM yyyy')}
          </div>
        </div>
      </div>
    </div>
  );
};
