
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Calendar, Users, FileText, Plus } from "lucide-react";
import { LeaveApplicationForm } from "./LeaveApplicationForm";
import { QuickTimesheetEntry } from "./QuickTimesheetEntry";

interface QuickActionsProps {
  employeeId: string;
}

export const QuickActions = ({ employeeId }: QuickActionsProps) => {
  const navigate = useNavigate();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isTimesheetDialogOpen, setIsTimesheetDialogOpen] = useState(false);

  const handleNavigateToTimesheet = () => {
    navigate("/timesheet");
  };

  const handleNavigateToHistory = () => {
    navigate("/history");
  };

  const actions = [
    {
      title: "Quick Time Entry",
      description: "Log hours for today",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => setIsTimesheetDialogOpen(true)
    },
    {
      title: "Apply for Leave",
      description: "Submit leave application",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: () => setIsLeaveDialogOpen(true)
    },
    {
      title: "View Timesheets",
      description: "Manage all timesheets",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: handleNavigateToTimesheet
    },
    {
      title: "View History",
      description: "Check submission history",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: handleNavigateToHistory
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3 hover:bg-gray-50"
              onClick={action.action}
            >
              <div className={`${action.bgColor} p-2 rounded-full mr-3`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Leave Application Dialog */}
        <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <LeaveApplicationForm 
              employeeId={employeeId} 
              onSuccess={() => setIsLeaveDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Quick Timesheet Entry Dialog */}
        <Dialog open={isTimesheetDialogOpen} onOpenChange={setIsTimesheetDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Time Entry</DialogTitle>
            </DialogHeader>
            <QuickTimesheetEntry 
              employeeId={employeeId} 
              onSuccess={() => setIsTimesheetDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
