
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimesheetHeader } from "@/components/timesheet/TimesheetHeader";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry, Timesheet } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

const TimesheetPage = () => {
  const [employeeName, setEmployeeName] = useState("John Employee");
  const [month, setMonth] = useState("May");
  const [year, setYear] = useState(2025);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 1)); // May 1st, 2025 as default

  useEffect(() => {
    // In a real app, we would fetch the timesheet data from the server
    // Here we're getting user data and generating mock entries
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setEmployeeName(user.name);
    }
    
    // Try to load existing timesheet from localStorage
    loadTimesheet();
  }, [month, year]);

  const loadTimesheet = () => {
    const timesheetKey = `timesheet-${month}-${year}`;
    const savedTimesheet = localStorage.getItem(timesheetKey);
    
    if (savedTimesheet) {
      const parsedTimesheet = JSON.parse(savedTimesheet) as Timesheet;
      setTimesheet(parsedTimesheet);
      setEntries(parsedTimesheet.entries);
      toast.info("Loaded existing timesheet");
    } else {
      generateMockEntries();
    }
  };

  const generateMockEntries = () => {
    const daysInMonth = new Date(year, getMonthNumber(month), 0).getDate();
    const newEntries: TimesheetEntry[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, getMonthNumber(month) - 1, day);
      const dateString = format(currentDate, "dd-MMM-yyyy");
      
      newEntries.push({
        id: `${day}-${month}-${year}`,
        date: dateString,
        workStart: "",
        workEnd: "",
        breakStart: "",
        breakEnd: "",
        otStart: "",
        otEnd: "",
        description: "",
        remarks: "",
        totalHours: 0.0,
        status: "draft",
      });
    }

    setEntries(newEntries);
  };

  const getMonthNumber = (monthName: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months.findIndex((m) => m === monthName) + 1;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setMonth(
      [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ][date.getMonth()]
    );
    setYear(date.getFullYear());
  };

  const handleSaveTimesheet = (updatedEntries: TimesheetEntry[]) => {
    // In a real app, we would save the data to the server
    setEntries(updatedEntries);
    
    // Create or update the timesheet object
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : { id: "guest", name: "Guest User" };
    
    const updatedTimesheet: Timesheet = {
      id: `${user.id}-${month}-${year}`,
      employeeId: user.id,
      employeeName: user.name,
      month: getMonthNumber(month),
      year: year,
      entries: updatedEntries,
      status: getTimesheetStatus(updatedEntries),
    };
    
    // Save to localStorage for persistence
    const timesheetKey = `timesheet-${month}-${year}`;
    localStorage.setItem(timesheetKey, JSON.stringify(updatedTimesheet));
    
    // Update employees table to show pending timesheet for admin
    updateEmployeePendingTimesheets(user.id);
    
    setTimesheet(updatedTimesheet);
  };

  // Update employee record to show pending timesheet
  const updateEmployeePendingTimesheets = (employeeId: string) => {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const updatedEmployees = employees.map((emp: any) => {
      if (emp.id === employeeId) {
        return { ...emp, pendingTimesheets: 1 };
      }
      return emp;
    });
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  const getTimesheetStatus = (entries: TimesheetEntry[]): Timesheet["status"] => {
    // If any entry is pending, the whole timesheet is pending
    if (entries.some(entry => entry.status === "pending")) {
      return "pending";
    }
    // If any entry is approved, and none are pending or rejected, the whole timesheet is approved
    if (entries.some(entry => entry.status === "approved") && 
        !entries.some(entry => entry.status === "pending" || entry.status === "rejected")) {
      return "approved";
    }
    // If any entry is rejected, and none are pending, the whole timesheet is rejected
    if (entries.some(entry => entry.status === "rejected") && 
        !entries.some(entry => entry.status === "pending")) {
      return "rejected";
    }
    // Default is draft
    return "draft";
  };

  const handleNewTimesheet = () => {
    // Clear all previous data to start fresh
    clearAllTimesheetData();
    
    const currentDate = new Date();
    setMonth(
      [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ][currentDate.getMonth()]
    );
    setYear(currentDate.getFullYear());
    setSelectedDate(currentDate);
    generateMockEntries();
    toast.success("New timesheet created");
  };
  
  // Clear all timesheet data from localStorage
  const clearAllTimesheetData = () => {
    // Get list of all keys in localStorage
    const keys = Object.keys(localStorage);
    
    // Find and remove all timesheet related entries
    keys.forEach(key => {
      if (key.startsWith('timesheet-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset pending timesheets count for all employees
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const updatedEmployees = employees.map((emp: any) => ({
      ...emp,
      pendingTimesheets: 0
    }));
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl py-5 px-4 sm:px-6 space-y-5">
        <TimesheetHeader
          employeeName={employeeName}
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onNewTimesheet={handleNewTimesheet}
          timesheetStatus={timesheet?.status || "draft"}
          onDateChange={handleDateChange}
        />
        
        <TimesheetTable
          month={month}
          year={year}
          entries={entries}
          onSave={handleSaveTimesheet}
        />
      </div>
    </MainLayout>
  );
};

export default TimesheetPage;
