
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Timesheet History</h1>
            <span className="text-sm text-gray-500">View and export your past timesheets</span>
          </div>
          <Separator className="mt-4" />
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-medium">Past Timesheets</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <nav className="space-y-2">
                  {timesheetHistory.map((sheet) => (
                    <Button
                      key={sheet.id}
                      variant={selectedTimesheet === sheet.id ? "default" : "outline"}
                      className={`w-full justify-start text-left ${
                        selectedTimesheet === sheet.id ? "bg-timetrack-blue" : ""
                      }`}
                      onClick={() => setSelectedTimesheet(sheet.id)}
                    >
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">
                          {sheet.month} {sheet.year}
                        </span>
                        <Badge
                          className={`ml-2 whitespace-nowrap ${
                            sheet.status === "Approved"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                          variant="outline"
                        >
                          {sheet.status}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <main className="md:col-span-3">
            <Card className="h-full shadow-sm">
              {selectedTimesheet ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold">
                        {timesheetHistory.find((t) => t.id === selectedTimesheet)?.month}{" "}
                        {timesheetHistory.find((t) => t.id === selectedTimesheet)?.year} Timesheet
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 bg-timetrack-lightBlue text-timetrack-blue hover:bg-timetrack-lightBlue/80"
                        size="sm"
                      >
                        <FileText className="h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TimesheetTable
                      month={timesheetHistory.find((t) => t.id === selectedTimesheet)?.month || ""}
                      year={timesheetHistory.find((t) => t.id === selectedTimesheet)?.year || 2025}
                      entries={mockEntries}
                      readOnly={true}
                    />
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Timesheet Selected</h3>
                  <p className="text-gray-500 max-w-sm">
                    Please select a timesheet from the history panel to view its details.
                  </p>
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
