
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Search, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry, Timesheet } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const HistoryPage = () => {
  const [selectedTimesheet, setSelectedTimesheet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [timesheetHistory, setTimesheetHistory] = useState<any[]>([]);
  const [selectedTimesheetData, setSelectedTimesheetData] = useState<Timesheet | null>(null);
  
  // Load actual timesheet history from localStorage
  useEffect(() => {
    loadTimesheetHistory();
  }, []);
  
  const loadTimesheetHistory = () => {
    const keys = Object.keys(localStorage);
    const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
    
    const history = timesheetKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        id: data.id || key,
        month: getMonthName(data.month) || 'Unknown',
        year: data.year || new Date().getFullYear(),
        status: capitalizeStatus(data.status || 'draft'),
        data: data
      };
    });
    
    setTimesheetHistory(history);
  };
  
  const getMonthName = (monthNumber: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
  };
  
  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter timesheets based on search query and status filter
  const filteredTimesheets = timesheetHistory
    .filter(sheet => {
      const matchesSearch = `${sheet.month} ${sheet.year}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || sheet.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.month} 1, ${a.year}`);
      const dateB = new Date(`${b.month} 1, ${b.year}`);
      return sortOrder === "asc" 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleTimesheetSelect = (timesheetId: string) => {
    setSelectedTimesheet(timesheetId);
    const selected = timesheetHistory.find(t => t.id === timesheetId);
    if (selected) {
      setSelectedTimesheetData(selected.data);
    }
  };
  
  const generatePDF = () => {
    if (selectedTimesheetData) {
      // Create a temporary print view
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = generatePrintContent(selectedTimesheetData);
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        toast.success("PDF generation initiated");
      }
    }
  };
  
  const generatePrintContent = (timesheet: Timesheet) => {
    const totalHours = timesheet.entries.reduce((sum, entry) => sum + entry.totalHours, 0);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timesheet Report - ${timesheet.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature div { width: 200px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TimeTrack Pro</h1>
            <h2>Employee Timesheet Report</h2>
          </div>
          <div class="info">
            <div>
              <p><strong>Employee:</strong> ${timesheet.employeeName}</p>
              <p><strong>Period:</strong> ${getMonthName(timesheet.month)} ${timesheet.year}</p>
            </div>
            <div>
              <p><strong>Status:</strong> ${capitalizeStatus(timesheet.status)}</p>
              <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Break</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${timesheet.entries.map(entry => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.workStart || '-'}</td>
                  <td>${entry.workEnd || '-'}</td>
                  <td>${entry.breakStart && entry.breakEnd ? `${entry.breakStart} - ${entry.breakEnd}` : '-'}</td>
                  <td>${entry.totalHours.toFixed(2)}</td>
                  <td>${entry.description || '-'}</td>
                  <td>${capitalizeStatus(entry.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="signature">
            <div>Employee Signature</div>
            <div>Manager Approval</div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Timesheet History</h1>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              View and export your past timesheets
            </div>
          </div>
          <Separator className="mt-2" />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Past Timesheets</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleSortOrder}
                    className="h-8 w-8 p-0"
                  >
                    {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search timesheets..."
                        className="pl-8 text-sm h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 px-2">
                          <Filter className="h-4 w-4 mr-1" />
                          <span className="sr-only sm:not-sr-only sm:text-xs">Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                          All Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterStatus("Approved")}>
                          Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Rejected")}>
                          Rejected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Pending")}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("Draft")}>
                          Draft
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <nav className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredTimesheets.length > 0 ? (
                    filteredTimesheets.map((sheet) => (
                      <Button
                        key={sheet.id}
                        variant={selectedTimesheet === sheet.id ? "default" : "outline"}
                        className={`w-full justify-start text-left ${
                          selectedTimesheet === sheet.id ? "bg-timetrack-blue" : ""
                        }`}
                        onClick={() => handleTimesheetSelect(sheet.id)}
                      >
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm">
                            {sheet.month} {sheet.year}
                          </span>
                          <Badge
                            className={`ml-2 whitespace-nowrap text-xs ${
                              sheet.status === "Approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : sheet.status === "Rejected"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : sheet.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }`}
                            variant="outline"
                          >
                            {sheet.status}
                          </Badge>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-500 text-sm">
                      {timesheetHistory.length === 0 
                        ? "No timesheets found. Create your first timesheet!"
                        : "No timesheets match your search"
                      }
                    </div>
                  )}
                </nav>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Card className="h-full shadow-sm">
              {selectedTimesheet && selectedTimesheetData ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <CardTitle className="text-lg font-semibold">
                        {getMonthName(selectedTimesheetData.month)} {selectedTimesheetData.year} Timesheet
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 bg-timetrack-lightBlue text-timetrack-blue hover:bg-timetrack-lightBlue/80"
                        size="sm"
                        onClick={generatePDF}
                      >
                        <FileText className="h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TimesheetTable
                      month={getMonthName(selectedTimesheetData.month)}
                      year={selectedTimesheetData.year}
                      entries={selectedTimesheetData.entries}
                      readOnly={true}
                      timesheetStatus={selectedTimesheetData.status}
                    />
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                  <Calendar className="h-12 w-12 text-gray-400 mb-6" />
                  <h3 className="text-lg font-medium text-gray-700 mb-3">No Timesheet Selected</h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    {timesheetHistory.length === 0 
                      ? "You haven't created any timesheets yet. Go to the Timesheet page to create your first one!"
                      : "Please select a timesheet from the history panel to view its details."
                    }
                  </p>
                  <div className="text-sm text-gray-400 italic">
                    {timesheetHistory.length > 0 && "You can filter and search timesheets using the controls on the left"}
                  </div>
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
