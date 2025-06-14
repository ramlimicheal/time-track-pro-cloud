
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, User } from "lucide-react";
import { liveTrackingManager, EmployeeActivity } from "@/utils/liveTracking";

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<EmployeeActivity[]>([]);

  useEffect(() => {
    const updateActivities = () => {
      setActivities(liveTrackingManager.getRecentActivities(15));
    };

    updateActivities();

    const handleActivityUpdate = () => updateActivities();
    const handleEmployeeOnline = () => updateActivities();
    const handleEmployeeOffline = () => updateActivities();

    liveTrackingManager.subscribe("activity-updated", handleActivityUpdate);
    liveTrackingManager.subscribe("employee-online", handleEmployeeOnline);
    liveTrackingManager.subscribe("employee-offline", handleEmployeeOffline);

    return () => {
      liveTrackingManager.unsubscribe("activity-updated", handleActivityUpdate);
      liveTrackingManager.unsubscribe("employee-online", handleEmployeeOnline);
      liveTrackingManager.unsubscribe("employee-offline", handleEmployeeOffline);
    };
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'came_online':
      case 'went_offline':
        return <User className="h-3 w-3" />;
      case 'timesheet_submitted':
      case 'leave_submitted':
        return <Clock className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'came_online':
        return 'bg-green-100 text-green-800';
      case 'went_offline':
      case 'went_idle':
        return 'bg-red-100 text-red-800';
      case 'timesheet_submitted':
      case 'leave_submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getEmployeeName = (employeeId: string) => {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const employee = employees.find((e: any) => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Live Activity Feed
          <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                <div className={`p-1 rounded-full ${getActivityColor(activity.action)}`}>
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {getEmployeeName(activity.employeeId)}
                    </p>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatAction(activity.action)}
                    {activity.details && ` - ${activity.details}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
