
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Employee } from "@/types";
import { EmployeeHeader } from "@/components/dashboard/EmployeeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { LeaveApplicationForm } from "@/components/dashboard/LeaveApplicationForm";
import { RecentLeaveApplications } from "@/components/dashboard/RecentLeaveApplications";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  useEffect(() => {
    // Get employee data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      // In a real app, we would fetch the full employee profile based on the user ID
      // For now, we'll use the user data from localStorage and add mock data
      setEmployee({
        id: user.id,
        name: user.name,
        email: user.email,
        department: "Engineering",
        position: "Software Developer",
        joinDate: "2023-01-15",
        status: "active",
        pendingTimesheets: 1,
        phoneNumber: "+968 9123 4567",
        bloodGroup: "O+",
        emergencyPhoneNumber: "+91 9876 5432",
        passportNumber: "J1234567",
        dob: "1990-05-15"
      });
    }
  }, []);

  if (!employee) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <EmployeeHeader employee={employee} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 space-y-6">
            <DashboardStats employee={employee} />
            <RecentLeaveApplications employeeId={employee.id} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <LeaveApplicationForm employeeId={employee.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
