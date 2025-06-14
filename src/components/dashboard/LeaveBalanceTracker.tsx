
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { LeaveApplication } from "@/types";
import { differenceInDays } from "date-fns";
import { dataSyncManager } from "@/utils/dataSync";

interface LeaveBalanceTrackerProps {
  employeeId: string;
}

interface LeaveBalance {
  annual: { total: number; used: number; pending: number };
  sick: { total: number; used: number; pending: number };
  personal: { total: number; used: number; pending: number };
}

export const LeaveBalanceTracker = ({ employeeId }: LeaveBalanceTrackerProps) => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    annual: { total: 21, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 }
  });

  useEffect(() => {
    const calculateLeaveBalance = () => {
      const applications: LeaveApplication[] = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
      const employeeApplications = applications.filter(app => app.employeeId === employeeId);

      const balance: LeaveBalance = {
        annual: { total: 21, used: 0, pending: 0 },
        sick: { total: 10, used: 0, pending: 0 },
        personal: { total: 5, used: 0, pending: 0 }
      };

      const currentYear = new Date().getFullYear();

      employeeApplications.forEach(app => {
        const appDate = new Date(app.startDate);
        // Only count applications from current year
        if (appDate.getFullYear() === currentYear) {
          const days = differenceInDays(new Date(app.endDate), new Date(app.startDate)) + 1;
          const leaveType = app.leaveType as keyof LeaveBalance;
          
          if (balance[leaveType]) {
            if (app.status === "approved") {
              balance[leaveType].used += days;
            } else if (app.status === "pending") {
              balance[leaveType].pending += days;
            }
          }
        }
      });

      setLeaveBalance(balance);
    };

    calculateLeaveBalance();

    // Subscribe to leave updates
    const handleLeaveUpdate = () => calculateLeaveBalance();
    dataSyncManager.subscribe("leave-submitted", handleLeaveUpdate);
    dataSyncManager.subscribe("leave-status-updated", handleLeaveUpdate);

    // Listen for storage changes
    const handleStorageChange = () => calculateLeaveBalance();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      dataSyncManager.unsubscribe("leave-submitted", handleLeaveUpdate);
      dataSyncManager.unsubscribe("leave-status-updated", handleLeaveUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employeeId]);

  const getProgressValue = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <div key={type} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium capitalize">{type} Leave</h3>
              <span className="text-sm text-gray-600">
                {balance.used + balance.pending}/{balance.total} days
              </span>
            </div>
            
            <Progress 
              value={getProgressValue(balance.used + balance.pending, balance.total)} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Used: {balance.used}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-600" />
                <span>Pending: {balance.pending}</span>
              </div>
              <span>Available: {balance.total - balance.used - balance.pending}</span>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p><strong>Leave Policy:</strong></p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Annual Leave: 21 days per year</li>
              <li>• Sick Leave: 10 days per year</li>
              <li>• Personal Leave: 5 days per year</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
