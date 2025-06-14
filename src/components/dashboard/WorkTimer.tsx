
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, Coffee } from "lucide-react";
import { useWorkTimer } from "@/hooks/useWorkTimer";

interface WorkTimerProps {
  employeeId: string;
  employeeName: string;
}

export const WorkTimer = ({ employeeId, employeeName }: WorkTimerProps) => {
  const {
    isRunning,
    currentSession,
    todayHours,
    elapsedTime,
    formattedTime,
    startWork,
    takeBreak,
    resumeWork,
    endWork
  } = useWorkTimer(employeeId, employeeName);

  const getStatusColor = () => {
    if (!currentSession) return "bg-gray-100 text-gray-800";
    if (isRunning) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = () => {
    if (!currentSession) return "Not Working";
    if (isRunning) return "Working";
    return "On Break";
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Work Timer
          </div>
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {formattedTime}
          </div>
          <p className="text-sm text-gray-600">Current Session</p>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{todayHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-600">Today's Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {currentSession ? Math.floor(elapsedTime / 60) : 0}m
            </p>
            <p className="text-xs text-gray-600">This Session</p>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2">
          {!currentSession ? (
            <Button onClick={startWork} className="flex-1 bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={takeBreak} variant="outline" className="flex-1">
                  <Coffee className="h-4 w-4 mr-2" />
                  Take Break
                </Button>
              ) : (
                <Button onClick={resumeWork} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={endWork} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                <Square className="h-4 w-4 mr-2" />
                End Work
              </Button>
            </>
          )}
        </div>

        {/* Session Info */}
        {currentSession && (
          <div className="text-xs text-gray-500 text-center">
            Started at {new Date(currentSession.startTime).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
      
      {/* Animated border for active timer */}
      {isRunning && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
      )}
    </Card>
  );
};
