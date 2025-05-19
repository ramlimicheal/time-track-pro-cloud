
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Search, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { TimesheetTable } from "@/components/timesheet/TimesheetTable";
import { TimesheetEntry } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
                        onClick={() => setSelectedTimesheet(sheet.id)}
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
                                : "bg-red-100 text-red-800 hover:bg-red-100"
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
                      No timesheets match your search
                    </div>
                  )}
                </nav>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Card className="h-full shadow-sm">
              {selectedTimesheet ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
                  <Calendar className="h-12 w-12 text-gray-400 mb-6" />
                  <h3 className="text-lg font-medium text-gray-700 mb-3">No Timesheet Selected</h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Please select a timesheet from the history panel to view its details.
                  </p>
                  <div className="text-sm text-gray-400 italic">
                    You can filter and search timesheets using the controls on the left
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
