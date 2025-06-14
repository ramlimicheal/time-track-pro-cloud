
import { Employee, TimesheetEntry, Timesheet, LeaveApplication } from "@/types";

// Event dispatcher for real-time updates
class DataSyncManager {
  private listeners: { [key: string]: Function[] } = {};

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

  // Employee data management
  updateEmployeeProfile(employeeId: string, updates: Partial<Employee>) {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const updatedEmployees = employees.map((emp: Employee) =>
      emp.id === employeeId ? { ...emp, ...updates } : emp
    );
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));

    // Update user data if it's the current user
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.id === employeeId) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...updates }));
      }
    }

    this.emit("employee-updated", { employeeId, updates });
  }

  // Timesheet management
  submitTimesheet(timesheet: Timesheet) {
    const timesheetKey = `timesheet-${timesheet.month}-${timesheet.year}-${timesheet.employeeId}`;
    localStorage.setItem(timesheetKey, JSON.stringify(timesheet));

    // Update employee pending count
    this.updateEmployeePendingTimesheets(timesheet.employeeId, 1);
    this.emit("timesheet-submitted", timesheet);
  }

  approveTimesheet(timesheetId: string, employeeId: string) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('timesheet-'));
    keys.forEach(key => {
      const timesheet = JSON.parse(localStorage.getItem(key) || '{}');
      if (timesheet.id === timesheetId) {
        timesheet.status = 'approved';
        timesheet.entries = timesheet.entries.map((entry: TimesheetEntry) => ({
          ...entry,
          status: 'approved'
        }));
        localStorage.setItem(key, JSON.stringify(timesheet));
      }
    });

    this.updateEmployeePendingTimesheets(employeeId, 0);
    this.emit("timesheet-approved", { timesheetId, employeeId });
  }

  private updateEmployeePendingTimesheets(employeeId: string, count: number) {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const updatedEmployees = employees.map((emp: Employee) =>
      emp.id === employeeId ? { ...emp, pendingTimesheets: count } : emp
    );
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  }

  // Leave management
  submitLeaveApplication(application: LeaveApplication) {
    const applications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    applications.push(application);
    localStorage.setItem("leaveApplications", JSON.stringify(applications));
    this.emit("leave-submitted", application);
  }

  updateLeaveStatus(applicationId: string, status: "approved" | "rejected") {
    const applications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    const updatedApplications = applications.map((app: LeaveApplication) =>
      app.id === applicationId ? { ...app, status } : app
    );
    localStorage.setItem("leaveApplications", JSON.stringify(updatedApplications));
    this.emit("leave-status-updated", { applicationId, status });
  }

  // Get employee statistics
  getEmployeeStats(employeeId: string) {
    // Get timesheet data
    const keys = Object.keys(localStorage).filter(key => key.startsWith('timesheet-'));
    let totalHours = 0;
    let pendingTimesheets = 0;
    
    keys.forEach(key => {
      const timesheet = JSON.parse(localStorage.getItem(key) || '{}');
      if (timesheet.employeeId === employeeId) {
        if (timesheet.status === 'pending') pendingTimesheets++;
        timesheet.entries?.forEach((entry: TimesheetEntry) => {
          totalHours += entry.totalHours || 0;
        });
      }
    });

    // Get leave data
    const applications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    const employeeApplications = applications.filter((app: LeaveApplication) => app.employeeId === employeeId);
    const pendingLeave = employeeApplications.filter((app: LeaveApplication) => app.status === "pending").length;

    return {
      totalHours,
      pendingTimesheets,
      pendingLeave,
      productivity: Math.min(100, Math.max(0, (totalHours / 160) * 100)) // Based on ~160 hours/month
    };
  }
}

export const dataSyncManager = new DataSyncManager();
