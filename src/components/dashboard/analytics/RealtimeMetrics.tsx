
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, AlertCircle } from "lucide-react";

export const RealtimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    attendanceRate: 94.5,
    productivityIndex: 87.2,
    overtimeHours: 156,
    safetyScore: 98.1,
    lastUpdated: new Date()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        attendanceRate: Math.max(85, Math.min(100, prev.attendanceRate + (Math.random() - 0.5) * 2)),
        productivityIndex: Math.max(70, Math.min(100, prev.productivityIndex + (Math.random() - 0.5) * 3)),
        lastUpdated: new Date()
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const todayStats = [
    {
      label: "On Time Arrivals",
      value: "142/150",
      percentage: 94.7,
      status: "good"
    },
    {
      label: "Break Compliance",
      value: "135/142",
      percentage: 95.1,
      status: "excellent"
    },
    {
      label: "Overtime Workers",
      value: "23/142",
      percentage: 16.2,
      status: "warning"
    },
    {
      label: "Safety Incidents",
      value: "0/142",
      percentage: 100,
      status: "excellent"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "warning": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "warning": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Live Performance Metrics
            </span>
            <Badge variant="outline" className="text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          </CardTitle>
          <CardDescription>
            Last updated: {metrics.lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">{metrics.attendanceRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.attendanceRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Productivity Index</span>
                <span className="font-medium">{metrics.productivityIndex.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.productivityIndex} className="h-2" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Today's Performance</h4>
            {todayStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{stat.label}</div>
                  <div className="text-xs text-gray-600">{stat.value}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getStatusColor(stat.status)}`}>
                    {stat.percentage.toFixed(1)}%
                  </div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full ${getProgressColor(stat.status)}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">Send Reminder</div>
              <div className="text-xs text-gray-600">Late check-ins</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">View Overtime</div>
              <div className="text-xs text-gray-600">Manage approvals</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">Safety Alert</div>
              <div className="text-xs text-gray-600">Send to all sites</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">Generate Report</div>
              <div className="text-xs text-gray-600">Daily summary</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
