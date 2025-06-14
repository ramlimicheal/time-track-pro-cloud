
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, XCircle, AlertCircle, Download, Filter, Calendar } from "lucide-react";
import { TimesheetEntry, Timesheet, Employee } from "@/types";
import { toast } from "sonner";

interface SmartTimesheetManagementProps {
  employees: Employee[];
}

export const SmartTimesheetManagement = ({ employees }: SmartTimesheetManagementProps) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = () => {
    // Simulate timesheet data
    const mockTimesheets: Timesheet[] = employees.map(emp => ({
      id: `ts-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)] as 'pending' | 'approved' | 'rejected',
      entries: generateMockEntries()
    }));
    setTimesheets(mockTimesheets);
  };

  const generateMockEntries = (): TimesheetEntry[] => {
    const entries: TimesheetEntry[] = [];
    for (let i = 1; i <= 5; i++) {
      entries.push({
        id: `entry-${i}`,
        date: `2024-01-${i.toString().padStart(2, '0')}`,
        workStart: "09:00",
        workEnd: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
        otStart: "",
        otEnd: "",
        description: `Daily work for day ${i}`,
        remarks: "",
        totalHours: 7,
        status: 'pending'
      });
    }
    return entries;
  };

  const bulkApproveTimesheets = (status: 'approved' | 'rejected') => {
    const pendingTimesheets = timesheets.filter(ts => ts.status === 'pending');
    const updatedTimesheets = timesheets.map(ts => 
      ts.status === 'pending' ? { ...ts, status } : ts
    );
    setTimesheets(updatedTimesheets);
    toast.success(`${pendingTimesheets.length} timesheets ${status}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    const matchesStatus = statusFilter === "all" || ts.status === statusFilter;
    const matchesEmployee = selectedEmployee === "all" || ts.employeeId === selectedEmployee;
    return matchesStatus && matchesEmployee;
  });

  const calculateTotalHours = (entries: TimesheetEntry[]) => {
    return entries.reduce((total, entry) => total + entry.totalHours, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Smart Timesheet Management</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => bulkApproveTimesheets('approved')}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Approve
            </Button>
            <Button 
              onClick={() => bulkApproveTimesheets('rejected')}
              variant="destructive"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Bulk Reject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {timesheets.filter(ts => ts.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {timesheets.filter(ts => ts.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Approved This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {timesheets.reduce((total, ts) => total + calculateTotalHours(ts.entries), 0)}
              </div>
              <p className="text-sm text-gray-600">Total Hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimesheets.map((timesheet) => {
                const employee = employees.find(emp => emp.id === timesheet.employeeId);
                return (
                  <TableRow key={timesheet.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{timesheet.employeeName}</div>
                        <div className="text-sm text-gray-500">{employee?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee?.department || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Jan {timesheet.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{calculateTotalHours(timesheet.entries)}h</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      2 days ago
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
