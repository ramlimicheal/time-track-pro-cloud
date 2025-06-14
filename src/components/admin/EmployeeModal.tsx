
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EmployeeForm } from "./EmployeeForm";
import { toast } from "sonner";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (employee: any) => void;
  onUpdate: (employee: any) => void;
  editingEmployee: any | null;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  editingEmployee
}: EmployeeModalProps) => {
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
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    const employeeData = {
      ...formData,
      id: editingEmployee ? editingEmployee.id : new Date().getTime().toString(),
    };

    if (editingEmployee) {
      onUpdate(employeeData);
    } else {
      onCreate(employeeData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        
        <EmployeeForm
          initialData={editingEmployee}
          formData={formData}
          setFormData={setFormData}
          generatedUsername={generatedUsername}
          setGeneratedUsername={setGeneratedUsername}
          generatedPassword={generatedPassword}
          setGeneratedPassword={setGeneratedPassword}
          mode={editingEmployee ? "edit" : "add"}
        />
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingEmployee ? "Update Employee" : "Create Employee"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
