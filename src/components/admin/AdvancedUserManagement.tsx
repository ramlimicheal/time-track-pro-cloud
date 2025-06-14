
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Shield, Search, Edit, Trash2, Key, Clock } from "lucide-react";
import { AuthUser, Role } from "@/types/auth";
import { ROLES } from "@/utils/rolePermissions";
import { toast } from "sonner";

export const AdvancedUserManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    roleId: "",
    mfaEnabled: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const enhancedUsers = storedUsers.map((user: any) => ({
      ...user,
      role: ROLES.find(r => r.id === user.roleId) || ROLES[4], // default to employee
      mfaEnabled: user.mfaEnabled || false,
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt || new Date().toISOString(),
      isActive: user.isActive !== false
    }));
    setUsers(enhancedUsers);
  };

  const createUser = () => {
    if (!newUser.name || !newUser.email || !newUser.roleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const user: AuthUser = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: ROLES.find(r => r.id === newUser.roleId)!,
      mfaEnabled: newUser.mfaEnabled,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    
    // Save to localStorage (simplified format)
    const simplifiedUsers = updatedUsers.map(u => ({
      id: u.id,
      username: u.name,
      email: u.email,
      password: "defaultPassword123", // In real app, this would be hashed
      roleId: u.role.id,
      role: u.role.name.toLowerCase(),
      mfaEnabled: u.mfaEnabled,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      isActive: u.isActive
    }));
    
    localStorage.setItem("users", JSON.stringify(simplifiedUsers));
    
    toast.success("User created successfully");
    setIsCreateDialogOpen(false);
    setNewUser({ name: "", email: "", roleId: "", mfaEnabled: false });
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    
    const simplifiedUsers = updatedUsers.map(u => ({
      id: u.id,
      username: u.name,
      email: u.email,
      password: "defaultPassword123",
      roleId: u.role.id,
      role: u.role.name.toLowerCase(),
      mfaEnabled: u.mfaEnabled,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      isActive: u.isActive
    }));
    
    localStorage.setItem("users", JSON.stringify(simplifiedUsers));
    toast.success("User status updated");
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role.id === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Advanced User Management</CardTitle>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Select onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between">
                  <label>Enable Multi-Factor Authentication</label>
                  <Switch
                    checked={newUser.mfaEnabled}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, mfaEnabled: checked })}
                  />
                </div>
                <Button onClick={createUser} className="w-full">Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map(role => (
                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${user.role.level >= 4 ? 'border-red-200 text-red-700 bg-red-50' : ''}
                      ${user.role.level === 3 ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
                      ${user.role.level <= 2 ? 'border-gray-200 text-gray-700 bg-gray-50' : ''}
                    `}>
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.mfaEnabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Key className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                      <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
