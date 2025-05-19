
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
}

export interface TimesheetEntry {
  id: string;
  date: string;
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
  otStart: string;
  otEnd: string;
  description: string;
  remarks: string;
  totalHours: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  entries: TimesheetEntry[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}
