
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeTable = ({ employees, onEdit, onDelete }: EmployeeTableProps) => {
  return (
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
                  onClick={() => onEdit(employee)}
                  className="h-8 w-8 p-0 mr-1"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(employee)}
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
  );
};

export default EmployeeTable;
