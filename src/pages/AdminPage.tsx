
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeTable } from "@/components/admin/EmployeeTable";
import { EmployeeModal } from "@/components/admin/EmployeeModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Plus
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { CleanAdminDashboard } from "@/components/dashboard/CleanAdminDashboard";
import { SmartTimesheetManagement } from "@/components/admin/SmartTimesheetManagement";
import { LeaveManagementDashboard } from "@/components/admin/LeaveManagementDashboard";

const AdminPage = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
    
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultAdmin: User = {
        id: "admin",
        name: "Administrator",
        email: "admin@example.com",
        role: "manager",
        username: "admin",
        password: "admin123"
      };
      localStorage.setItem("users", JSON.stringify([defaultAdmin]));
      setUsers([defaultAdmin]);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);
  
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);
  
  const handleCreateEmployee = (newEmployee: any) => {
    setEmployees([...employees, newEmployee]);
    setIsFormOpen(false);
    toast.success("Employee created successfully");
  };
  
  const handleUpdateEmployee = (updatedEmployee: any) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );
    setEmployees(updatedEmployees);
    setEditingEmployee(null);
    setIsFormOpen(false);
    toast.success("Employee updated successfully");
  };
  
  const handleDeleteEmployee = (employeeToDelete: any) => {
    const updatedEmployees = employees.filter(
      (employee) => employee.id !== employeeToDelete.id
    );
    setEmployees(updatedEmployees);
    toast.success("Employee deleted successfully");
  };
  
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleCreateAdmin = () => {
    if (newUsername && newPassword) {
      const newAdmin: User = {
        id: new Date().getTime().toString(),
        name: newUsername,
        email: `${newUsername}@example.com`,
        role: "manager",
        username: newUsername,
        password: newPassword
      };
      setUsers([...users, newAdmin]);
      setNewUsername("");
      setNewPassword("");
      toast.success("Admin created successfully");
    } else {
      toast.error("Please enter a username and password");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Manage employees, timesheets, and leave applications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="users">Admin Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <CleanAdminDashboard employees={employees} />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeTable
              employees={employees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
            <EmployeeModal
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onCreate={handleCreateEmployee}
              onUpdate={handleUpdateEmployee}
              editingEmployee={editingEmployee}
            />
          </TabsContent>

          <TabsContent value="timesheets" className="space-y-4">
            <SmartTimesheetManagement employees={employees} />
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <LeaveManagementDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Admin Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreateAdmin}>Create Admin</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
