
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrintableTimesheetReport } from "./PrintableTimesheetReport";
import { Employee, TimesheetEntry, Timesheet } from "@/types";
import { FileTextIcon, FileChartLineIcon, ChartBar, ChartPie } from "lucide-react";
import { DepartmentSummaryReport } from "./reports/DepartmentSummaryReport";
import { OvertimeSummary } from "./reports/OvertimeSummary";

interface ReportsSectionProps {
  employees: Employee[];
}

export const ReportsSection = ({ employees }: ReportsSectionProps) => {
  const [reportType, setReportType] = useState<string>("timesheet");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("may2025");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [timesheetStatus, setTimesheetStatus] = useState<"draft" | "pending" | "approved" | "rejected">("pending");

  // Get employee object from selected ID
  const selectedEmployeeObj = selectedEmployee 
    ? employees.find(emp => emp.id === selectedEmployee) 
    : undefined;

  // Handle employee selection for timesheet report
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    
    // Find timesheets for this employee
    const timesheets = findTimesheetsForEmployee(employeeId);
    if (timesheets.length > 0) {
      const latestTimesheet = timesheets[0]; // Assuming the first one is the most recent
      setTimesheetEntries(latestTimesheet.entries);
      setTimesheetStatus(latestTimesheet.status);
    } else {
      // Fallback to mock data if no actual timesheet exists
      setTimesheetEntries([
        {
          id: "entry1",
          date: "01-May-2025",
          workStart: "09:00",
          workEnd: "17:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          otStart: "",
          otEnd: "",
          description: "Regular work day",
          remarks: "",
          totalHours: 7,
          status: "pending"
        }
      ]);
    }
  };

  // Find all timesheets for a specific employee
  const findTimesheetsForEmployee = (employeeId: string): Timesheet[] => {
    const keys = Object.keys(localStorage);
    const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
    
    const timesheets: Timesheet[] = [];
    
    timesheetKeys.forEach(key => {
      try {
        const timesheet = JSON.parse(localStorage.getItem(key) || '{}') as Timesheet;
        if (timesheet.employeeId === employeeId) {
          timesheets.push(timesheet);
        }
      } catch (e) {
        console.error("Error parsing timesheet:", e);
      }
    });
    
    // Sort by most recent (assuming higher month/year is more recent)
    return timesheets.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  };

  // Print the current report
  const handlePrint = () => {
    window.print();
  };

  // Function to get reporting period details
  const getPeriodDetails = (periodId: string) => {
    const [month, year] = periodId.replace('period', '').split('-');
    return {
      month: month || 'May',
      year: parseInt(year || '2025')
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold">Generate Reports</h2>
          <p className="text-muted-foreground">
            View and generate various reports for your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <FileTextIcon size={18} />
            Print Report
          </Button>
        </div>
      </div>

      {/* Report selection tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="timesheet" className="flex items-center gap-2">
            <FileTextIcon size={16} />
            <span className="hidden sm:inline">Timesheet</span>
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-2">
            <ChartBar size={16} />
            <span className="hidden sm:inline">Department</span>
          </TabsTrigger>
          <TabsTrigger value="overtime" className="flex items-center gap-2">
            <FileChartLineIcon size={16} />
            <span className="hidden sm:inline">Overtime</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <ChartPie size={16} />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Timesheet Report */}
        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Timesheet Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-1">Select Employee</label>
                  <Select onValueChange={handleEmployeeSelect} value={selectedEmployee || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-1">Reporting Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="may2025">May 2025</SelectItem>
                      <SelectItem value="apr2025">April 2025</SelectItem>
                      <SelectItem value="mar2025">March 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedEmployeeObj ? (
                <>
                  {/* Preview of the report on screen */}
                  <div className="print:hidden border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Report Preview</h3>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <p><span className="font-medium">Employee:</span> {selectedEmployeeObj.name}</p>
                        <p><span className="font-medium">Department:</span> {selectedEmployeeObj.department}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Period:</span> {selectedPeriod.replace('2025', ' 2025')}</p>
                        <p><span className="font-medium">Status:</span> {timesheetStatus}</p>
                      </div>
                    </div>
                    
                    {/* Table with sample data */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2 text-left">Date</th>
                            <th className="border px-4 py-2 text-left">Hours</th>
                            <th className="border px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timesheetEntries.slice(0, 5).map((entry) => (
                            <tr key={entry.id}>
                              <td className="border px-4 py-2">{entry.date}</td>
                              <td className="border px-4 py-2">{entry.totalHours.toFixed(2)}</td>
                              <td className="border px-4 py-2">{entry.status}</td>
                            </tr>
                          ))}
                          {timesheetEntries.length > 5 && (
                            <tr>
                              <td colSpan={3} className="border px-4 py-2 text-center text-gray-500">
                                And {timesheetEntries.length - 5} more entries...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* The actual printable report that only shows when printing */}
                  <PrintableTimesheetReport
                    employee={selectedEmployeeObj}
                    entries={timesheetEntries}
                    timesheetStatus={timesheetStatus}
                    selectedEmployee={selectedEmployee}
                  />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select an employee to generate a timesheet report
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Summary Report */}
        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-1">Reporting Period</label>
                  <Select defaultValue="may2025">
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="may2025">May 2025</SelectItem>
                      <SelectItem value="apr2025">April 2025</SelectItem>
                      <SelectItem value="mar2025">March 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DepartmentSummaryReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overtime Report */}
        <TabsContent value="overtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overtime Analysis Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Reporting Period</label>
                  <Select defaultValue="may2025">
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="may2025">May 2025</SelectItem>
                      <SelectItem value="apr2025">April 2025</SelectItem>
                      <SelectItem value="q22025">Q2 2025</SelectItem>
                      <SelectItem value="ytd2025">YTD 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <OvertimeSummary />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Reporting Period</label>
                  <Select defaultValue="may2025">
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="may2025">May 2025</SelectItem>
                      <SelectItem value="apr2025">April 2025</SelectItem>
                      <SelectItem value="q22025">Q2 2025</SelectItem>
                      <SelectItem value="ytd2025">YTD 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Placeholder for Summary Report */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Employee Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Chart: Employee Distribution by Department</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Engineering</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finance</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HR</span>
                        <span className="font-medium">12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Chart: Attendance Trends</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Present</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Leave</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absent</span>
                        <span className="font-medium">3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
