interface LiveEmployee {
  id: string;
  name: string;
  status: string;
  lastActivity: string;
  workHours: number;
  isOnline: boolean;
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
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Initialize with some dummy data
    this.addEmployee("1", "John Doe");
    this.addEmployee("2", "Jane Smith");
    this.addEmployee("3", "Alice Johnson");
    this.addEmployee("4", "Bob Williams");
    this.addEmployee("5", "Emily Brown");
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

  updateActivity(employeeId: string, activity: string, details: string) {
    const employee = this.employees.get(employeeId);
    if (employee) {
      employee.status = activity;
      employee.lastActivity = new Date().toISOString();
      employee.isOnline = true;
      this.employees.set(employeeId, employee);
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
      recentActivities: employees.length,
      workingNow
    };
  }

  getAllEmployees(): LiveEmployee[] {
    return Array.from(this.employees.values());
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
