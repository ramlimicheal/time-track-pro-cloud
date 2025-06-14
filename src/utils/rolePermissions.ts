
import { Role, Permission } from '@/types/auth';

export const PERMISSIONS: Permission[] = [
  { id: 'user.create', name: 'Create Users', description: 'Can create new user accounts' },
  { id: 'user.read', name: 'View Users', description: 'Can view user information' },
  { id: 'user.update', name: 'Update Users', description: 'Can modify user accounts' },
  { id: 'user.delete', name: 'Delete Users', description: 'Can delete user accounts' },
  { id: 'employee.create', name: 'Create Employees', description: 'Can add new employees' },
  { id: 'employee.read', name: 'View Employees', description: 'Can view employee information' },
  { id: 'employee.update', name: 'Update Employees', description: 'Can modify employee records' },
  { id: 'employee.delete', name: 'Delete Employees', description: 'Can remove employees' },
  { id: 'timesheet.approve', name: 'Approve Timesheets', description: 'Can approve/reject timesheets' },
  { id: 'timesheet.view_all', name: 'View All Timesheets', description: 'Can view all employee timesheets' },
  { id: 'leave.approve', name: 'Approve Leave', description: 'Can approve/reject leave requests' },
  { id: 'reports.view', name: 'View Reports', description: 'Can access reporting features' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export report data' },
  { id: 'system.settings', name: 'System Settings', description: 'Can modify system settings' },
  { id: 'audit.view', name: 'View Audit Logs', description: 'Can access audit trail' }
];

export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    level: 5,
    permissions: PERMISSIONS
  },
  {
    id: 'admin',
    name: 'Admin',
    level: 4,
    permissions: PERMISSIONS.filter(p => !p.id.includes('system.settings'))
  },
  {
    id: 'manager',
    name: 'Manager',
    level: 3,
    permissions: PERMISSIONS.filter(p => 
      p.id.includes('employee.read') || 
      p.id.includes('timesheet') || 
      p.id.includes('leave.approve') || 
      p.id.includes('reports.view')
    )
  },
  {
    id: 'hr',
    name: 'HR',
    level: 3,
    permissions: PERMISSIONS.filter(p => 
      p.id.includes('employee') || 
      p.id.includes('leave') || 
      p.id.includes('reports')
    )
  },
  {
    id: 'employee',
    name: 'Employee',
    level: 1,
    permissions: PERMISSIONS.filter(p => 
      p.id === 'employee.read' || 
      p.id === 'timesheet.view_all'
    )
  }
];

export const hasPermission = (userRole: Role, permission: string): boolean => {
  return userRole.permissions.some(p => p.id === permission);
};

export const canAccessResource = (userRole: Role, resource: string): boolean => {
  const resourcePermissions = {
    'users': 'user.read',
    'employees': 'employee.read',
    'timesheets': 'timesheet.view_all',
    'reports': 'reports.view',
    'audit': 'audit.view'
  };
  
  const requiredPermission = resourcePermissions[resource as keyof typeof resourcePermissions];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};
