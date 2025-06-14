import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Employee } from "@/types";
import { EmployeeHeader } from "@/components/dashboard/EmployeeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { LeaveApplicationForm } from "@/components/dashboard/LeaveApplicationForm";
import { RecentLeaveApplications } from "@/components/dashboard/RecentLeaveApplications";
import { LeaveBalanceTracker } from "@/components/dashboard/LeaveBalanceTracker";
import { ProfileManagement } from "@/components/dashboard/ProfileManagement";
import { useNavigate } from "react-router-dom";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== "employee") {
      navigate("/");
      return;
    }
    
    // Get employee data from localStorage
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    const matchingEmployee = storedEmployees.find((emp: any) => emp.id === user.id);
    
    if (matchingEmployee) {
      setEmployee({
        id: user.id,
        name: user.name,
        email: user.email,
        department: matchingEmployee.department,
        position: matchingEmployee.position,
        joinDate: matchingEmployee.joinDate,
        status: matchingEmployee.status || "active",
        pendingTimesheets: matchingEmployee.pendingTimesheets || 0,
        phoneNumber: matchingEmployee.phoneNumber,
        bloodGroup: matchingEmployee.bloodGroup,
        emergencyPhoneNumber: matchingEmployee.emergencyPhoneNumber,
        passportNumber: matchingEmployee.passportNumber,
        dob: matchingEmployee.dob,
        avatar: matchingEmployee.avatar,
        indianAddress: matchingEmployee.indianAddress,
        omanAddress: matchingEmployee.omanAddress
      });
    } else {
      // If employee not found in the system, use basic user data
      setEmployee({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department || "",
        position: user.position || "",
        joinDate: user.joinDate || "",
        status: "active",
        pendingTimesheets: 0
      });
    }
  }, [navigate]);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setEmployee(prevEmployee => {
          if (!prevEmployee) return null;
          return {
            ...prevEmployee,
            ...user
          };
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleProfileUpdate = (updatedEmployee: Employee) => {
    setEmployee(updatedEmployee);
  };

  if (!employee) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            <p className="text-gray-600">Setting up your dashboard</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <EmployeeHeader employee={employee} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardStats employee={employee} />
            <EnhancedDashboard userRole="employee" />
          </div>
          
          <div className="space-y-6">
            <LeaveBalanceTracker employeeId={employee.id} />
            <RecentLeaveApplications employeeId={employee.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
