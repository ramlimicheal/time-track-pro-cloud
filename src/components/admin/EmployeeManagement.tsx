import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Employee } from "@/types";
import { toast } from "sonner";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeForm } from "./EmployeeForm";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
export interface EmployeeManagementProps {
  employees: Employee[];
}
export const EmployeeManagement = ({
  employees: initialEmployees
}: EmployeeManagementProps) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Form state for adding/editing employees
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    joinDate: "",
    status: "active",
    dob: "",
    bloodGroup: "",
    passportNumber: "",
    phoneNumber: "",
    indianAddress: "",
    omanAddress: "",
    emergencyPhoneNumber: "",
    username: "",
    password: ""
  });
  const handleAddEmployee = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.dob || !formData.phoneNumber || !formData.passportNumber || !formData.indianAddress || !formData.omanAddress || !formData.emergencyPhoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new employee
    const newEmployee = {
      id: `emp-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      position: formData.position,
      joinDate: formData.joinDate,
      status: formData.status,
      pendingTimesheets: 0,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      passportNumber: formData.passportNumber,
      phoneNumber: formData.phoneNumber,
      indianAddress: formData.indianAddress,
      omanAddress: formData.omanAddress,
      emergencyPhoneNumber: formData.emergencyPhoneNumber,
      username: formData.username || generatedUsername,
      password: formData.password || generatedPassword
    };
    setEmployees(prev => [...prev, newEmployee]);
    toast.success("Employee added successfully");
    toast.success(`Username: ${newEmployee.username} and Password: ${newEmployee.password} created`);
    setIsAddDialogOpen(false);

    // Save to localStorage
    const updatedEmployees = [...employees, newEmployee];
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));

    // Reset form
    setFormData({
      name: "",
      email: "",
      department: "",
      position: "",
      joinDate: "",
      status: "active",
      dob: "",
      bloodGroup: "",
      passportNumber: "",
      phoneNumber: "",
      indianAddress: "",
      omanAddress: "",
      emergencyPhoneNumber: "",
      username: "",
      password: ""
    });
    setGeneratedUsername("");
    setGeneratedPassword("");
  };
  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      position: employee.position || "",
      joinDate: employee.joinDate || "",
      status: employee.status || "active",
      dob: employee.dob || "",
      bloodGroup: employee.bloodGroup || "",
      passportNumber: employee.passportNumber || "",
      phoneNumber: employee.phoneNumber || "",
      indianAddress: employee.indianAddress || "",
      omanAddress: employee.omanAddress || "",
      emergencyPhoneNumber: employee.emergencyPhoneNumber || "",
      username: employee.username || "",
      password: employee.password || ""
    });
    setIsEditDialogOpen(true);
  };
  const handleEditEmployee = () => {
    if (!selectedEmployee) return;

    // Validate form
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Update employee
    const updatedEmployees = employees.map(emp => emp.id === selectedEmployee.id ? {
      ...emp,
      ...formData
    } : emp);
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    toast.success("Employee updated successfully");
    setIsEditDialogOpen(false);
  };
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;

    // Remove employee
    const filteredEmployees = employees.filter(emp => emp.id !== selectedEmployee.id);
    setEmployees(filteredEmployees);
    localStorage.setItem("employees", JSON.stringify(filteredEmployees));
    toast.success("Employee removed successfully");
    setIsDeleteDialogOpen(false);
  };
  return <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="p-4 bg-timetrack-lightBlue border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          <h2 className="text-lg font-medium">Employee Management</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-1 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto px-[20px] mx-0">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details for the new employee.
              </DialogDescription>
            </DialogHeader>
            
            <EmployeeForm formData={formData} setFormData={setFormData} generatedUsername={generatedUsername} setGeneratedUsername={setGeneratedUsername} generatedPassword={generatedPassword} setGeneratedPassword={setGeneratedPassword} mode="add" />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddEmployee}>
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <EmployeeTable employees={employees} onEdit={handleEditClick} onDelete={handleDeleteClick} />

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          
          <EmployeeForm initialData={selectedEmployee} formData={formData} setFormData={setFormData} generatedUsername={generatedUsername} setGeneratedUsername={setGeneratedUsername} generatedPassword={generatedPassword} setGeneratedPassword={setGeneratedPassword} mode="edit" />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditEmployee}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteEmployeeDialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} employee={selectedEmployee} onDelete={handleDeleteEmployee} />
    </div>;
};