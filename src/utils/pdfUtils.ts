
import { TimesheetEntry, Timesheet } from "@/types";

export const generateTimesheetPDF = (timesheet: Timesheet, employeeName?: string) => {
  const totalHours = timesheet.entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = monthNames[timesheet.month - 1] || "Unknown";
  const displayName = employeeName || timesheet.employeeName || "Employee";
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Timesheet Report - ${displayName}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            line-height: 1.4;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header h2 {
            color: #666;
            margin: 0;
            font-size: 18px;
            font-weight: normal;
          }
          .info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 14px;
          }
          .info-section strong {
            color: #2563eb;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #2563eb; 
            color: white;
            font-weight: bold;
          }
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tbody tr:hover {
            background-color: #e3f2fd;
          }
          .status-approved { color: #16a34a; font-weight: bold; }
          .status-rejected { color: #dc2626; font-weight: bold; }
          .status-pending { color: #ca8a04; font-weight: bold; }
          .status-draft { color: #6b7280; font-weight: bold; }
          .summary {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
          }
          .signature { 
            margin-top: 50px; 
            display: flex; 
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box { 
            width: 250px; 
            text-align: center;
          }
          .signature-line {
            border-bottom: 2px solid #000; 
            padding-bottom: 5px;
            margin-bottom: 10px;
            height: 40px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e5e5;
            padding-top: 15px;
          }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TimeTrack Pro</h1>
          <h2>Employee Timesheet Report</h2>
        </div>
        
        <div class="info">
          <div class="info-section">
            <p><strong>Employee:</strong> ${displayName}</p>
            <p><strong>Employee ID:</strong> ${timesheet.employeeId}</p>
            <p><strong>Period:</strong> ${monthName} ${timesheet.year}</p>
          </div>
          <div class="info-section">
            <p><strong>Status:</strong> <span class="status-${timesheet.status}">${timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}</span></p>
            <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="summary">
          <h3 style="margin-top: 0; color: #2563eb;">Summary</h3>
          <p><strong>Total Working Days:</strong> ${timesheet.entries.filter(e => e.totalHours > 0).length}</p>
          <p><strong>Average Hours per Day:</strong> ${(totalHours / Math.max(timesheet.entries.filter(e => e.totalHours > 0).length, 1)).toFixed(2)}</p>
          <p><strong>Overtime Hours:</strong> ${timesheet.entries.reduce((sum, e) => sum + (e.otStart && e.otEnd ? parseFloat(e.otEnd.split(':')[0]) - parseFloat(e.otStart.split(':')[0]) : 0), 0).toFixed(2)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Break Start</th>
              <th>Break End</th>
              <th>OT Start</th>
              <th>OT End</th>
              <th>Hours</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${timesheet.entries.map(entry => `
              <tr>
                <td><strong>${entry.date}</strong></td>
                <td>${entry.workStart || '-'}</td>
                <td>${entry.workEnd || '-'}</td>
                <td>${entry.breakStart || '-'}</td>
                <td>${entry.breakEnd || '-'}</td>
                <td>${entry.otStart || '-'}</td>
                <td>${entry.otEnd || '-'}</td>
                <td><strong>${entry.totalHours.toFixed(2)}</strong></td>
                <td>${entry.description || '-'}</td>
                <td><span class="status-${entry.status}">${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="signature">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>Employee Signature</strong></p>
            <p>Date: _______________</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>Manager Approval</strong></p>
            <p>Date: _______________</p>
          </div>
        </div>
        
        <div class="footer">
          <p>TimeTrack Pro - Employee Timesheet Management System</p>
          <p>This document was generated automatically on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  // Open in new window for printing/PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Auto-print after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
    
    return true;
  }
  return false;
};

export const generateEmployeeReportPDF = (employees: any[], timesheets: any[]) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalTimesheets = timesheets.length;
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employee Report</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; }
          .summary { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2563eb; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TimeTrack Pro</h1>
          <h2>Employee Management Report</h2>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Employees:</strong> ${totalEmployees}</p>
          <p><strong>Active Employees:</strong> ${activeEmployees}</p>
          <p><strong>Total Timesheets:</strong> ${totalTimesheets}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Join Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.email}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>${emp.joinDate}</td>
                <td>${emp.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
    return true;
  }
  return false;
};
