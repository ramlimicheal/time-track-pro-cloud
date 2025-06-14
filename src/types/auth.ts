
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  level: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
