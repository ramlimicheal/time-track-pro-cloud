
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { TimesheetReview } from "@/components/admin/TimesheetReview";
import { TimesheetAnalytics } from "@/components/admin/TimesheetAnalytics";
import { PendingTimesheetsTable } from "@/components/admin/PendingTimesheetsTable";
import { LeaveApplicationsReview } from "@/components/admin/LeaveApplicationsReview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 sm:grid-cols-5 md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-6 grid-cols-1">
              <TimesheetAnalytics />
              <PendingTimesheetsTable />
            </div>
          </TabsContent>
          
          <TabsContent value="employees">
            <h1 className="text-3xl font-bold mb-6">Employee Management</h1>
            <EmployeeManagement />
          </TabsContent>
          
          <TabsContent value="timesheets">
            <h1 className="text-3xl font-bold mb-6">Timesheet Review</h1>
            <TimesheetReview />
          </TabsContent>
          
          <TabsContent value="reports">
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 py-4">Reports functionality coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leaves">
            <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
            <LeaveApplicationsReview />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
