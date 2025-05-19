
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Lock, Image } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onUpdateProfile: (updatedData: any) => void;
}

export const EditProfileModal = ({ isOpen, onClose, employee, onUpdateProfile }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phoneNumber: employee?.phoneNumber || "",
    password: "",
    confirmPassword: "",
    avatar: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Prepare data for update
    const updatedData = {
      ...employee,
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      avatar: formData.avatar || employee?.avatar,
    };

    // Include password only if provided
    if (formData.password) {
      updatedData.password = formData.password;
    }

    onUpdateProfile(updatedData);
    toast.success("Profile updated successfully");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and password
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-blue-100">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-blue-500 text-white text-2xl">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
                title="Upload profile picture"
              >
                <Image className="h-5 w-5 text-gray-600" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>
          
          <FormField 
            label="Full Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            icon={User}
          />
          
          <FormField 
            label="Email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            type="email" 
          />
          
          <FormField 
            label="Phone Number" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            placeholder="+968 9123 4567" 
          />
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-4">Change Password</h3>
            
            <FormField 
              label="New Password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              type="password" 
              icon={Lock}
            />
            
            <FormField 
              label="Confirm Password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              type="password"
              icon={Lock} 
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
