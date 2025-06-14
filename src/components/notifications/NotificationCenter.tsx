
import { useState, useEffect } from "react";
import { Bell, X, Check, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsed);
    }
  };

  const checkForNewNotifications = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const newNotifications: Notification[] = [];
    
    // Check for timesheet approvals/rejections
    if (user.role === "employee") {
      const timesheetKeys = Object.keys(localStorage).filter(key => key.startsWith('timesheet-'));
      timesheetKeys.forEach(key => {
        const timesheet = JSON.parse(localStorage.getItem(key) || '{}');
        if (timesheet.employeeId === user.id) {
          const hasApprovedEntries = timesheet.entries?.some((e: any) => e.status === 'approved');
          const hasRejectedEntries = timesheet.entries?.some((e: any) => e.status === 'rejected');
          
          if (hasApprovedEntries) {
            newNotifications.push({
              id: `timesheet-approved-${key}`,
              title: "Timesheet Approved",
              message: `Your timesheet for ${getMonthName(timesheet.month)} ${timesheet.year} has been approved`,
              type: "success",
              timestamp: new Date(),
              read: false
            });
          }
          
          if (hasRejectedEntries) {
            newNotifications.push({
              id: `timesheet-rejected-${key}`,
              title: "Timesheet Rejected",
              message: `Your timesheet for ${getMonthName(timesheet.month)} ${timesheet.year} needs revision`,
              type: "error",
              timestamp: new Date(),
              read: false
            });
          }
        }
      });
    }
    
    // Check for leave application updates
    const leaveApplications = JSON.parse(localStorage.getItem("leaveApplications") || "[]");
    leaveApplications.forEach((app: any) => {
      if (app.employeeId === user.id && app.status !== "pending") {
        newNotifications.push({
          id: `leave-${app.status}-${app.id}`,
          title: `Leave Application ${app.status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your leave request from ${app.startDate} to ${app.endDate} has been ${app.status}`,
          type: app.status === 'approved' ? "success" : "error",
          timestamp: new Date(),
          read: false
        });
      }
    });
    
    // Add new notifications if they don't already exist
    const existingIds = new Set(notifications.map(n => n.id));
    const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
    
    if (uniqueNew.length > 0) {
      const updated = [...notifications, ...uniqueNew];
      setNotifications(updated);
      localStorage.setItem("notifications", JSON.stringify(updated));
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <Check className="h-4 w-4 text-green-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((notification, index) => (
                <div key={notification.id}>
                  <Card className={`border-0 rounded-none ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {notification.timestamp.toLocaleString()}
                          </p>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
