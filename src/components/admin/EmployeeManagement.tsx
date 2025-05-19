import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Users, Edit, User, Calendar, Droplet, 
  Phone, Home, Building, PhoneCall, Mail, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Employee } from "@/types";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface EmployeeManagementProps {
  employees: Employee[];
}

// Generate a random username based on name
const generateUsername = (name: string): string => {
  const nameParts = name.toLowerCase().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}.${lastName.substring(0, 3)}${randomNum}`;
};

// Generate a random password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const EmployeeManagement = ({ employees: initialEmployees }: EmployeeManagementProps) => {
  const [employees, setEmployees] = useState(initialEmployees);
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

  const departments = ["Engineering", "Marketing", "Finance", "HR", "Operations", "Sales"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If name is being changed, generate a new username
    if (name === "name" && value) {
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

  const handleAddEmployee = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.department || !formData.position || 
        !formData.dob || !formData.phoneNumber || !formData.passportNumber || 
        !formData.indianAddress || !formData.omanAddress || !formData.emergencyPhoneNumber) {
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
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      joinDate: employee.joinDate,
      status: employee.status,
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
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? { ...emp, ...formData } 
        : emp
    );
    
    setEmployees(updatedEmployees);
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
    toast.success("Employee removed successfully");
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
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
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details for the new employee.
              </DialogDescription>
            </DialogHeader>
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
                    value={formData.username || generatedUsername} 
                    onChange={handleInputChange} 
                    className="w-full bg-gray-50" 
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated username</p>
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
                    value={formData.password || generatedPassword} 
                    onChange={handleInputChange} 
                    className="w-full bg-gray-50" 
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated password</p>
                </div>
              </div>
            </div>
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Passport No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.phoneNumber || "N/A"}</TableCell>
                <TableCell>{employee.passportNumber || "N/A"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    employee.status === 'active' ? 'bg-green-100 text-green-800' : 
                    employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditClick(employee)}
                    className="h-8 w-8 p-0 mr-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(employee)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
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
              <Input 
                name="username" 
                value={formData.username} 
                className="col-span-3 bg-gray-50" 
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="flex items-center justify-end text-sm">
                <Key className="h-4 w-4 mr-2" />
                <label>Password</label>
              </div>
              <Input 
                name="password" 
                value={formData.password} 
                className="col-span-3 bg-gray-50" 
                readOnly
              />
            </div>
          </div>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedEmployee?.name} from the system? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteEmployee}>
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
