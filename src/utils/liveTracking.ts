interface LiveEmployee {
  id: string;
  name: string;
  status: string;
  lastActivity: string;
  workHours: number;
  isOnline: boolean;
}

interface OnlineEmployee {
  id: string;
  name: string;
  currentActivity: string;
  lastActivity: string;
  workHoursToday: number;
  isOnline: boolean;
}

interface EmployeeActivity {
  id: string;
  employeeId: string;
  action: string;
  details: string;
  timestamp: string;
}

interface LiveStats {
  onlineEmployees: number;
  totalWorkHoursToday: number;
  activeNow: number;
  recentActivities: number;
  workingNow: number;
}

class LiveTrackingManager {
  private employees: Map<string, LiveEmployee> = new Map();
  private activities: EmployeeActivity[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Initialize with some dummy data
    this.addEmployee("1", "John Doe");
    this.addEmployee("2", "Jane Smith");
    this.addEmployee("3", "Alice Johnson");
    this.addEmployee("4", "Bob Williams");
    this.addEmployee("5", "Emily Brown");
    
    // Simulate some employees being online
    this.employeeOnline("1", "John Doe");
    this.employeeOnline("2", "Jane Smith");
    this.updateActivity("1", "Working", "Developing new features");
    this.updateActivity("2", "Active", "In meeting");
  }

  addEmployee(employeeId: string, employeeName: string) {
    const newEmployee: LiveEmployee = {
      id: employeeId,
      name: employeeName,
      status: "Offline",
      lastActivity: new Date().toISOString(),
      workHours: 0,
      isOnline: false
    };
    this.employees.set(employeeId, newEmployee);
  }

  removeEmployee(employeeId: string) {
    this.employees.delete(employeeId);
  }

  employeeOnline(employeeId: string, employeeName: string) {
    let employee = this.employees.get(employeeId);
    if (!employee) {
      this.addEmployee(employeeId, employeeName);
      employee = this.employees.get(employeeId)!;
    }
    
    employee.isOnline = true;
    employee.status = "Online";
    employee.lastActivity = new Date().toISOString();
    this.employees.set(employeeId, employee);
    
    this.addActivity(employeeId, "came_online", "Employee came online");
    this.notifyListeners('employee-online', { employeeId, employeeName });
  }

  employeeOffline(employeeId: string) {
    const employee = this.employees.get(employeeId);
    if (employee) {
      employee.isOnline = false;
      employee.status = "Offline";
      employee.lastActivity = new Date().toISOString();
      this.employees.set(employeeId, employee);
      
      this.addActivity(employeeId, "went_offline", "Employee went offline");
      this.notifyListeners('employee-offline', { employeeId });
    }
  }

  updateActivity(employeeId: string, activity: string, details: string) {
    const employee = this.employees.get(employeeId);
    if (employee) {
      employee.status = activity;
      employee.lastActivity = new Date().toISOString();
      employee.isOnline = true;
      this.employees.set(employeeId, employee);
      
      this.addActivity(employeeId, activity.toLowerCase().replace(' ', '_'), details);
      this.notifyListeners('activity-updated', { employeeId, activity, details });
    }
  }

  updateWorkHours(employeeId: string, hours: number) {
    const employee = this.employees.get(employeeId);
    if (employee) {
      employee.workHours = hours;
      this.employees.set(employeeId, employee);
      this.notifyListeners('work-hours-updated', { employeeId, hours });
    }
  }

  getOnlineEmployees(): OnlineEmployee[] {
    const employees = Array.from(this.employees.values());
    const now = new Date().getTime();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    return employees
      .filter(emp => {
        const lastActivity = new Date(emp.lastActivity).getTime();
        return emp.isOnline && lastActivity > fiveMinutesAgo;
      })
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        currentActivity: emp.status,
        lastActivity: emp.lastActivity,
        workHoursToday: emp.workHours,
        isOnline: emp.isOnline
      }));
  }

  getRecentActivities(limit: number = 15): EmployeeActivity[] {
    return this.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getLiveStats(): LiveStats {
    const employees = Array.from(this.employees.values());
    const now = new Date().getTime();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    const onlineEmployees = employees.filter(emp => {
      const lastActivity = new Date(emp.lastActivity).getTime();
      return emp.isOnline && lastActivity > fiveMinutesAgo;
    }).length;

    const workingNow = employees.filter(emp => 
      emp.status === "Working" && emp.isOnline
    ).length;

    const totalWorkHoursToday = employees.reduce((total, emp) => total + emp.workHours, 0);

    return {
      onlineEmployees,
      totalWorkHoursToday,
      activeNow: onlineEmployees,
      recentActivities: this.activities.length,
      workingNow
    };
  }

  getAllEmployees(): LiveEmployee[] {
    return Array.from(this.employees.values());
  }

  private addActivity(employeeId: string, action: string, details: string) {
    const activity: EmployeeActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.activities.unshift(activity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const liveTrackingManager = new LiveTrackingManager();
export type { OnlineEmployee, EmployeeActivity, LiveStats, LiveEmployee };
