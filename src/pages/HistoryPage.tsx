
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";

const HistoryPage = () => {
  const [selectedTimesheet, setSelectedTimesheet] = useState<string | null>(null);
  
  // Mock data for timesheet history
  const timesheetHistory = [
    { id: "1", month: "April", year: 2025, status: "Approved" },
    { id: "2", month: "March", year: 2025, status: "Approved" },
    { id: "3", month: "February", year: 2025, status: "Rejected" },
  ];
  
  // Mock entries for selected timesheet
  const mockEntries: TimesheetEntry[] = [
    {
      id: "1",
      date: "01-Apr-2025",
      workStart: "09:00",
      workEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      otStart: "",
      otEnd: "",
      description: "Regular work day",
      remarks: "",
      totalHours: 7.0,
      status: "approved",
    },
    {
      id: "2",
      date: "02-Apr-2025",
      workStart: "09:00",
      workEnd: "18:00",
      breakStart: "12:30",
      breakEnd: "13:30",
      otStart: "18:00",
      otEnd: "19:00",
      description: "Project meeting",
      remarks: "Overtime approved",
      totalHours: 8.0,
      status: "approved",
    },
    {
      id: "3",
      date: "03-Apr-2025",
      workStart: "09:00",
      workEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      otStart: "",
      otEnd: "",
      description: "Client call",
      remarks: "",
      totalHours: 7.0,
      status: "approved",
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Timesheet History</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium text-gray-800 mb-4">Past Timesheets</h2>
              <div className="space-y-2">
                {timesheetHistory.map((sheet) => (
                  <Button
                    key={sheet.id}
                    variant={selectedTimesheet === sheet.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedTimesheet === sheet.id ? "bg-timetrack-blue" : ""
                    }`}
                    onClick={() => setSelectedTimesheet(sheet.id)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {sheet.month} {sheet.year}
                    </span>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                        sheet.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sheet.status}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            {selectedTimesheet ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {timesheetHistory.find((t) => t.id === selectedTimesheet)?.month}{" "}
                    {timesheetHistory.find((t) => t.id === selectedTimesheet)?.year} Timesheet
                  </h2>
                  <Button>Export PDF</Button>
                </div>
                
                <TimesheetTable
                  month={timesheetHistory.find((t) => t.id === selectedTimesheet)?.month || ""}
                  year={timesheetHistory.find((t) => t.id === selectedTimesheet)?.year || 2025}
                  entries={mockEntries}
                  readOnly={true}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Timesheet Selected</h3>
                <p className="text-gray-500">
                  Please select a timesheet from the history to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
