
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, Activity } from "lucide-react";
import { liveTrackingManager, OnlineEmployee } from "@/utils/liveTracking";

export const LiveEmployeeGrid = () => {
  const [onlineEmployees, setOnlineEmployees] = useState<OnlineEmployee[]>([]);
  const [liveStats, setLiveStats] = useState({
    onlineEmployees: 0,
    totalWorkHoursToday: 0,
    activeNow: 0,
    recentActivities: 0
  });

  useEffect(() => {
    const updateData = () => {
      setOnlineEmployees(liveTrackingManager.getOnlineEmployees());
      setLiveStats(liveTrackingManager.getLiveStats());
    };

    updateData();

    const handleEmployeeOnline = () => updateData();
    const handleEmployeeOffline = () => updateData();
    const handleActivityUpdate = () => updateData();
    const handleHeartbeat = () => updateData();

    liveTrackingManager.subscribe("employee-online", handleEmployeeOnline);
    liveTrackingManager.subscribe("employee-offline", handleEmployeeOffline);
    liveTrackingManager.subscribe("activity-updated", handleActivityUpdate);
    liveTrackingManager.subscribe("heartbeat", handleHeartbeat);

    return () => {
      liveTrackingManager.unsubscribe("employee-online", handleEmployeeOnline);
      liveTrackingManager.unsubscribe("employee-offline", handleEmployeeOffline);
      liveTrackingManager.unsubscribe("activity-updated", handleActivityUpdate);
      liveTrackingManager.unsubscribe("heartbeat", handleHeartbeat);
    };
  }, []);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Live Stats with work timer data */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Online Now</p>
              <p className="text-xl font-bold text-green-600">{liveStats.onlineEmployees}</p>
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Working Now</p>
              <p className="text-xl font-bold text-blue-600">{liveStats.workingNow || 0}</p>
            </div>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Now</p>
              <p className="text-xl font-bold text-purple-600">{liveStats.activeNow}</p>
            </div>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Work Hours</p>
              <p className="text-xl font-bold text-orange-600">{liveStats.totalWorkHoursToday}h</p>
            </div>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Activities</p>
              <p className="text-xl font-bold text-red-600">{liveStats.recentActivities}</p>
            </div>
            <User className="h-4 w-4 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Online Employees Grid with work status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Employee Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onlineEmployees.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No employees online</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {onlineEmployees.map((employee) => (
                <div key={employee.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.currentActivity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Online
                      </Badge>
                      {employee.currentActivity === "Working" && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                          Working
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Work Hours:</span>
                      <span className="font-medium">{employee.workHoursToday.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Last Activity:</span>
                      <span className="text-gray-500">{getTimeAgo(employee.lastActivity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
