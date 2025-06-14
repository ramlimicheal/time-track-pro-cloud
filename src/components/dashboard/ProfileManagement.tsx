
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EditProfileModal } from "./EditProfileModal";
import { Employee } from "@/types";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Edit,
  Heart,
  Passport
} from "lucide-react";

interface ProfileManagementProps {
  employee: Employee;
  onProfileUpdate: (updatedEmployee: Employee) => void;
}

export const ProfileManagement = ({ employee, onProfileUpdate }: ProfileManagementProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<Employee>(employee);

  useEffect(() => {
    setProfileData(employee);
  }, [employee]);

  const handleUpdateProfile = (updatedData: Employee) => {
    setProfileData(updatedData);
    onProfileUpdate(updatedData);
    
    // Update in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Also update employees list if exists
      const employees = localStorage.getItem("employees");
      if (employees) {
        const employeesList = JSON.parse(employees);
        const updatedEmployees = employeesList.map((emp: any) => 
          emp.id === updatedData.id ? { ...emp, ...updatedData } : emp
        );
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      }
    }
  };

  const ProfileField = ({ icon: Icon, label, value, className = "" }: {
    icon: any;
    label: string;
    value: string | undefined;
    className?: string;
  }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 ${className}`}>
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-medium text-gray-900 truncate">
          {value || "Not provided"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-blue-100">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-xl">{profileData.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {profileData.position}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {profileData.department}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" /> 
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField icon={Mail} label="Email" value={profileData.email} />
            <ProfileField icon={Phone} label="Phone" value={profileData.phoneNumber} />
            <ProfileField icon={Phone} label="Emergency Contact" value={profileData.emergencyPhoneNumber} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField icon={User} label="Employee ID" value={profileData.id.substring(0, 8)} />
            <ProfileField icon={Briefcase} label="Position" value={profileData.position} />
            <ProfileField icon={Calendar} label="Join Date" value={
              profileData.joinDate ? format(new Date(profileData.joinDate), 'dd MMM yyyy') : undefined
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField icon={Calendar} label="Date of Birth" value={
              profileData.dob ? format(new Date(profileData.dob), 'dd MMM yyyy') : undefined
            } />
            <ProfileField icon={Heart} label="Blood Group" value={profileData.bloodGroup} />
            <ProfileField icon={Passport} label="Passport Number" value={profileData.passportNumber} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField 
              icon={MapPin} 
              label="India Address" 
              value={profileData.indianAddress}
              className="md:col-span-2"
            />
            <ProfileField 
              icon={MapPin} 
              label="Oman Address" 
              value={profileData.omanAddress}
              className="md:col-span-2"
            />
          </CardContent>
        </Card>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={profileData}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};
