import { dataSyncManager } from "./dataSync";

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface OnlineEmployee {
  id: string;
  name: string;
  isOnline: boolean;
  lastActivity: string;
  sessionDuration: number;
  currentActivity: string;
  workHoursToday: number;
}

class LiveTrackingManager {
  private onlineEmployees: Map<string, OnlineEmployee> = new Map();
  private activities: EmployeeActivity[] = [];
  private listeners: { [key: string]: Function[] } = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadStoredData();
    this.startHeartbeat();
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Employee comes online
  employeeOnline(employeeId: string, employeeName: string) {
    const now = new Date().toISOString();
    const employee: OnlineEmployee = {
      id: employeeId,
      name: employeeName,
      isOnline: true,
      lastActivity: now,
      sessionDuration: 0,
      currentActivity: "Dashboard",
      workHoursToday: this.getTodayWorkHours(employeeId)
    };

    this.onlineEmployees.set(employeeId, employee);
    this.addActivity(employeeId, "came_online", "Employee logged in");
    this.saveToStorage();
    this.emit("employee-online", employee);
  }

  // Employee goes offline
  employeeOffline(employeeId: string) {
    const employee = this.onlineEmployees.get(employeeId);
    if (employee) {
      employee.isOnline = false;
      this.addActivity(employeeId, "went_offline", "Employee logged out");
      this.saveToStorage();
      this.emit("employee-offline", employee);
    }
  }

  // Update employee activity
  updateActivity(employeeId: string, activity: string, details?: string) {
    const employee = this.onlineEmployees.get(employeeId);
    if (employee) {
      employee.currentActivity = activity;
      employee.lastActivity = new Date().toISOString();
      this.addActivity(employeeId, activity.toLowerCase().replace(/\s+/g, '_'), details);
      this.saveToStorage();
      this.emit("activity-updated", { employeeId, activity, details });
    }
  }

  // Track work hours in real-time
  updateWorkHours(employeeId: string, hours: number) {
    const employee = this.onlineEmployees.get(employeeId);
    if (employee) {
      employee.workHoursToday = hours;
      this.saveToStorage();
      this.emit("work-hours-updated", { employeeId, hours });
    }
  }

  // Get all online employees
  getOnlineEmployees(): OnlineEmployee[] {
    return Array.from(this.onlineEmployees.values()).filter(emp => emp.isOnline);
  }

  // Get recent activities
  getRecentActivities(limit: number = 10): EmployeeActivity[] {
    return this.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get employee status
  getEmployeeStatus(employeeId: string): OnlineEmployee | null {
    return this.onlineEmployees.get(employeeId) || null;
  }

  // Get live statistics
  getLiveStats() {
    const onlineCount = this.getOnlineEmployees().length;
    const totalWorkHours = Array.from(this.onlineEmployees.values())
      .reduce((sum, emp) => sum + emp.workHoursToday, 0);
    const activeNow = this.getOnlineEmployees().filter(emp => 
      new Date().getTime() - new Date(emp.lastActivity).getTime() < 5 * 60 * 1000 // Active in last 5 minutes
    ).length;

    return {
      onlineEmployees: onlineCount,
      totalWorkHoursToday: Math.round(totalWorkHours * 10) / 10,
      activeNow,
      recentActivities: this.getRecentActivities(5).length
    };
  }

  private addActivity(employeeId: string, action: string, details?: string) {
    const activity: EmployeeActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      action,
      timestamp: new Date().toISOString(),
      details
    };

    this.activities.unshift(activity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
  }

  private getTodayWorkHours(employeeId: string): number {
    // Get today's work hours from existing timesheet data
    const today = new Date();
    const keys = Object.keys(localStorage).filter(key => key.startsWith('timesheet-'));
    
    for (const key of keys) {
      try {
        const timesheet = JSON.parse(localStorage.getItem(key) || '{}');
        if (timesheet.employeeId === employeeId && 
            timesheet.month === today.getMonth() && 
            timesheet.year === today.getFullYear()) {
          const todayEntry = timesheet.entries?.find((entry: any) => 
            new Date(entry.date).toDateString() === today.toDateString()
          );
          return todayEntry?.totalHours || 0;
        }
      } catch (e) {
        console.error("Error parsing timesheet:", e);
      }
    }
    
    return 0;
  }

  private saveToStorage() {
    localStorage.setItem('liveTracking', JSON.stringify({
      onlineEmployees: Array.from(this.onlineEmployees.entries()),
      activities: this.activities.slice(0, 50) // Save only recent activities
    }));
  }

  private loadStoredData() {
    try {
      const stored = localStorage.getItem('liveTracking');
      if (stored) {
        const data = JSON.parse(stored);
        this.onlineEmployees = new Map(data.onlineEmployees || []);
        this.activities = data.activities || [];
        
        // Mark all as offline on page load (they'll come back online when they connect)
        this.onlineEmployees.forEach(employee => {
          employee.isOnline = false;
        });
      }
    } catch (e) {
      console.error("Error loading live tracking data:", e);
    }
  }

  private startHeartbeat() {
    // Update session durations every minute
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      this.onlineEmployees.forEach(employee => {
        if (employee.isOnline) {
          const lastActivity = new Date(employee.lastActivity).getTime();
          const timeSinceActivity = now - lastActivity;
          
          // Mark as offline if no activity for 10 minutes
          if (timeSinceActivity > 10 * 60 * 1000) {
            employee.isOnline = false;
            this.addActivity(employee.id, "went_idle", "No activity detected");
            this.emit("employee-idle", employee);
          } else {
            employee.sessionDuration = Math.floor(timeSinceActivity / 1000 / 60); // in minutes
          }
        }
      });
      
      this.saveToStorage();
      this.emit("heartbeat", this.getLiveStats());
    }, 60000); // Every minute
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}

export const liveTrackingManager = new LiveTrackingManager();
