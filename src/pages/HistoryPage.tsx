
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";
import { EnhancedHistoryDashboard } from "@/components/history/EnhancedHistoryDashboard";
import { Timesheet } from "@/types";

const HistoryPage = () => {
  const [timesheetHistory, setTimesheetHistory] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load timesheet history from localStorage
  useEffect(() => {
    loadTimesheetHistory();
  }, []);
  
  const loadTimesheetHistory = () => {
    setIsLoading(true);
    try {
      const keys = Object.keys(localStorage);
      const timesheetKeys = keys.filter(key => key.startsWith('timesheet-'));
      
      const history: Timesheet[] = timesheetKeys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          id: data.id || key,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || 'Unknown',
          month: data.month || new Date().getMonth() + 1,
          year: data.year || new Date().getFullYear(),
          status: data.status || 'draft',
          entries: data.entries || []
        };
      });
      
      // Sort by year and month (newest first)
      history.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      setTimesheetHistory(history);
    } catch (error) {
      console.error("Error loading timesheet history:", error);
      toast.error("Failed to load timesheet history");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportReport = () => {
    // Generate comprehensive report
    generateComprehensiveReport();
  };
  
  const generateComprehensiveReport = () => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : { name: "Employee" };
    
    // Calculate overall statistics
    let totalHours = 0;
    let totalDays = 0;
    let overtimeHours = 0;
    
    timesheetHistory.forEach(timesheet => {
      timesheet.entries.forEach(entry => {
        totalHours += entry.totalHours;
        if (entry.totalHours > 0) totalDays++;
        if (entry.totalHours > 8) {
          overtimeHours += entry.totalHours - 8;
        }
      });
    });
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprehensive Timesheet Report - ${user.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .summary { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .summary-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f8fafc; 
              font-weight: bold;
            }
            .status-approved { color: #16a34a; font-weight: bold; }
            .status-pending { color: #ca8a04; font-weight: bold; }
            .status-rejected { color: #dc2626; font-weight: bold; }
            .status-draft { color: #6b7280; font-weight: bold; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TimeTrack Pro</h1>
            <h2>Comprehensive Timesheet Report</h2>
            <p><strong>Employee:</strong> ${user.name}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Hours</h3>
              <div class="value">${totalHours.toFixed(1)}h</div>
            </div>
            <div class="summary-card">
              <h3>Working Days</h3>
              <div class="value">${totalDays}</div>
            </div>
            <div class="summary-card">
              <h3>Average Daily</h3>
              <div class="value">${totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0}h</div>
            </div>
            <div class="summary-card">
              <h3>Overtime</h3>
              <div class="value">${overtimeHours.toFixed(1)}h</div>
            </div>
          </div>
          
          <h3>Timesheet Summary by Month</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Total Hours</th>
                <th>Working Days</th>
                <th>Average Daily</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${timesheetHistory.map(timesheet => {
                const monthHours = timesheet.entries.reduce((sum, entry) => sum + entry.totalHours, 0);
                const workingDays = timesheet.entries.filter(entry => entry.totalHours > 0).length;
                const avgDaily = workingDays > 0 ? monthHours / workingDays : 0;
                const monthName = new Date(timesheet.year, timesheet.month - 1).toLocaleString('default', { month: 'long' });
                
                return `
                  <tr>
                    <td>${monthName}</td>
                    <td>${timesheet.year}</td>
                    <td>${monthHours.toFixed(1)}h</td>
                    <td>${workingDays}</td>
                    <td>${avgDaily.toFixed(1)}h</td>
                    <td class="status-${timesheet.status}">${timesheet.status.toUpperCase()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="page-break"></div>
          <h3>Detailed Entry Records</h3>
          ${timesheetHistory.map(timesheet => {
            const monthName = new Date(timesheet.year, timesheet.month - 1).toLocaleString('default', { month: 'long' });
            return `
              <h4>${monthName} ${timesheet.year}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Break</th>
                    <th>OT</th>
                    <th>Hours</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${timesheet.entries.filter(entry => entry.totalHours > 0).map(entry => `
                    <tr>
                      <td>${entry.date}</td>
                      <td>${entry.workStart || '-'}</td>
                      <td>${entry.workEnd || '-'}</td>
                      <td>${entry.breakStart && entry.breakEnd ? `${entry.breakStart}-${entry.breakEnd}` : '-'}</td>
                      <td>${entry.otStart && entry.otEnd ? `${entry.otStart}-${entry.otEnd}` : '-'}</td>
                      <td>${entry.totalHours.toFixed(2)}h</td>
                      <td>${entry.description || '-'}</td>
                      <td class="status-${entry.status}">${entry.status.toUpperCase()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          }).join('')}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      toast.success("Comprehensive report generated successfully");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            <p className="text-gray-600">Loading your timesheet history</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-timetrack-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Timesheet History</h1>
                <p className="text-gray-600">Complete overview and analysis of your timesheet data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {timesheetHistory.length} timesheet{timesheetHistory.length !== 1 ? 's' : ''}
              </Badge>
              <Button onClick={handleExportReport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
          <Separator className="mt-2" />
        </header>
        
        {timesheetHistory.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-3">No Timesheets Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't created any timesheets yet. Start by creating your first timesheet to track your work hours.
              </p>
              <Button>Create First Timesheet</Button>
            </CardContent>
          </Card>
        ) : (
          <EnhancedHistoryDashboard 
            timesheets={timesheetHistory}
            onExport={handleExportReport}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
