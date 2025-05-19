
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TimesheetHeader } from "@/components/timesheet/TimesheetHeader";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { toast } from "sonner";

const TimesheetPage = () => {
  const [employeeName, setEmployeeName] = useState("John Employee");
  const [month, setMonth] = useState("May");
  const [year, setYear] = useState(2025);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    // In a real app, we would fetch the timesheet data from the server
    // Here we're generating mock data
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setEmployeeName(user.name);
    }

    generateMockEntries();
  }, [month, year]);

  const generateMockEntries = () => {
    const daysInMonth = new Date(year, getMonthNumber(month), 0).getDate();
    const newEntries: TimesheetEntry[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      newEntries.push({
        id: `${day}-${month}-${year}`,
        date: `${day.toString().padStart(2, "0")}-${month.substring(0, 3)}-${year}`,
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

  const handleSaveTimesheet = (updatedEntries: TimesheetEntry[]) => {
    // In a real app, we would save the data to the server
    setEntries(updatedEntries);
    toast.success("Timesheet saved successfully");
  };

  const handleNewTimesheet = () => {
    const currentDate = new Date();
    setMonth(
      [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ][currentDate.getMonth()]
    );
    setYear(currentDate.getFullYear());
    generateMockEntries();
    toast.success("New timesheet created");
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl">
        <TimesheetHeader
          employeeName={employeeName}
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onNewTimesheet={handleNewTimesheet}
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
