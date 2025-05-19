
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimesheetHeader } from "@/components/timesheet/TimesheetHeader";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry, Timesheet } from "@/types";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";

const TimesheetPage = () => {
  const [employeeName, setEmployeeName] = useState("John Employee");
  const [month, setMonth] = useState("May");
  const [year, setYear] = useState(2025);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 1)); // May 1st, 2025 as default
  const [filteredEntries, setFilteredEntries] = useState<TimesheetEntry[]>([]);

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
  
  // Update filtered entries whenever selectedDate or entries change
  useEffect(() => {
    if (selectedDate && entries.length > 0) {
      const dateStr = format(selectedDate, "dd-MMM-yyyy");
      const filtered = entries.filter(entry => entry.date === dateStr);
      setFilteredEntries(filtered);
    }
  }, [selectedDate, entries]);

  const loadTimesheet = () => {
    const timesheetKey = `timesheet-${month}-${year}`;
    const savedTimesheet = localStorage.getItem(timesheetKey);
    
    if (savedTimesheet) {
      const parsedTimesheet = JSON.parse(savedTimesheet) as Timesheet;
      setTimesheet(parsedTimesheet);
      setEntries(parsedTimesheet.entries);
      
      // Filter entries for selected date
      const dateStr = format(selectedDate, "dd-MMM-yyyy");
      const filtered = parsedTimesheet.entries.filter(entry => entry.date === dateStr);
      setFilteredEntries(filtered);
      
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
    
    // Filter entries for selected date
    const dateStr = format(selectedDate, "dd-MMM-yyyy");
    const filtered = newEntries.filter(entry => entry.date === dateStr);
    setFilteredEntries(filtered);
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
    
    // If month or year changes, update those states too
    const newMonth = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ][date.getMonth()];
    
    if (newMonth !== month || date.getFullYear() !== year) {
      setMonth(newMonth);
      setYear(date.getFullYear());
    } else {
      // Just filter entries for the selected date
      const dateStr = format(date, "dd-MMM-yyyy");
      const filtered = entries.filter(entry => entry.date === dateStr);
      setFilteredEntries(filtered);
    }
  };

  const handleSaveTimesheet = (updatedEntries: TimesheetEntry[]) => {
    // Merge updated entries with existing entries
    const mergedEntries = entries.map(entry => {
      const updated = updatedEntries.find(e => e.id === entry.id);
      return updated || entry;
    });
    
    setEntries(mergedEntries);
    
    // Update filtered entries for the selected date
    const dateStr = format(selectedDate, "dd-MMM-yyyy");
    const filtered = mergedEntries.filter(entry => entry.date === dateStr);
    setFilteredEntries(filtered);
    
    // Create or update the timesheet object
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : { id: "guest", name: "Guest User" };
    
    const updatedTimesheet: Timesheet = {
      id: `${user.id}-${month}-${year}`,
      employeeId: user.id,
      employeeName: user.name,
      month: getMonthNumber(month),
      year: year,
      entries: mergedEntries,
      status: getTimesheetStatus(mergedEntries),
    };
    
    // Save to localStorage for persistence
    const timesheetKey = `timesheet-${month}-${year}`;
    localStorage.setItem(timesheetKey, JSON.stringify(updatedTimesheet));
    
    // Update employees table to show pending timesheet for admin
    updateEmployeePendingTimesheets(user.id);
    
    setTimesheet(updatedTimesheet);
    
    toast.success(`Timesheet for ${format(selectedDate, "dd MMM yyyy")} submitted for approval`);
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
          selectedDate={selectedDate}
        />
        
        <div className="bg-white p-4 rounded-md shadow mb-4">
          <h3 className="text-lg font-medium mb-1">Timesheet for {format(selectedDate, "dd MMMM yyyy")}</h3>
          <p className="text-sm text-gray-500">Enter your hours for the selected day and submit for approval</p>
        </div>
        
        <TimesheetTable
          month={month}
          year={year}
          entries={filteredEntries}
          onSave={handleSaveTimesheet}
          selectedDate={selectedDate}
          isDateSpecific={true}
        />
      </div>
    </MainLayout>
  );
};

export default TimesheetPage;
