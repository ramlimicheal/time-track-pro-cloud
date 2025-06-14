
import { useState, useEffect, useRef } from "react";
import { liveTrackingManager } from "@/utils/liveTracking";

export interface WorkSession {
  id: string;
  startTime: string;
  endTime?: string;
  totalMinutes: number;
  status: 'active' | 'paused' | 'completed';
}

export const useWorkTimer = (employeeId: string, employeeName: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [todayHours, setTodayHours] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved timer state on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem(`workTimer-${employeeId}`);
    if (savedTimer) {
      const timerData = JSON.parse(savedTimer);
      if (timerData.currentSession && timerData.currentSession.status === 'active') {
        const startTime = new Date(timerData.currentSession.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        setCurrentSession(timerData.currentSession);
        setElapsedTime(elapsed);
        setIsRunning(true);
      }
      setTodayHours(timerData.todayHours || 0);
    }
  }, [employeeId]);

  // Timer interval
  useEffect(() => {
    if (isRunning && currentSession) {
      intervalRef.current = setInterval(() => {
        const startTime = new Date(currentSession.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Update work hours in live tracking every minute
        if (elapsed % 60 === 0) {
          const hours = elapsed / 3600;
          liveTrackingManager.updateWorkHours(employeeId, todayHours + hours);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentSession, employeeId, todayHours]);

  // Save timer state to localStorage
  const saveTimerState = (session: WorkSession | null, hours: number) => {
    const timerData = {
      currentSession: session,
      todayHours: hours,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`workTimer-${employeeId}`, JSON.stringify(timerData));
  };

  const startWork = () => {
    const newSession: WorkSession = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      totalMinutes: 0,
      status: 'active'
    };
    
    setCurrentSession(newSession);
    setIsRunning(true);
    setElapsedTime(0);
    
    // Update live tracking
    liveTrackingManager.updateActivity(employeeId, "Working", "Started work session");
    
    saveTimerState(newSession, todayHours);
  };

  const takeBreak = () => {
    if (currentSession && isRunning) {
      const updatedSession = {
        ...currentSession,
        status: 'paused' as const,
        totalMinutes: Math.floor(elapsedTime / 60)
      };
      
      setCurrentSession(updatedSession);
      setIsRunning(false);
      
      // Update live tracking
      liveTrackingManager.updateActivity(employeeId, "Break", "Taking a break");
      
      saveTimerState(updatedSession, todayHours);
    }
  };

  const resumeWork = () => {
    if (currentSession && !isRunning) {
      const updatedSession = {
        ...currentSession,
        status: 'active' as const,
        startTime: new Date(Date.now() - (elapsedTime * 1000)).toISOString()
      };
      
      setCurrentSession(updatedSession);
      setIsRunning(true);
      
      // Update live tracking
      liveTrackingManager.updateActivity(employeeId, "Working", "Resumed work session");
      
      saveTimerState(updatedSession, todayHours);
    }
  };

  const endWork = () => {
    if (currentSession) {
      const sessionHours = elapsedTime / 3600;
      const newTodayHours = todayHours + sessionHours;
      
      const completedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        status: 'completed' as const,
        totalMinutes: Math.floor(elapsedTime / 60)
      };
      
      setCurrentSession(null);
      setIsRunning(false);
      setElapsedTime(0);
      setTodayHours(newTodayHours);
      
      // Update live tracking
      liveTrackingManager.updateActivity(employeeId, "Work Ended", `Completed ${sessionHours.toFixed(1)} hours`);
      liveTrackingManager.updateWorkHours(employeeId, newTodayHours);
      
      saveTimerState(null, newTodayHours);
      
      return completedSession;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    currentSession,
    todayHours,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startWork,
    takeBreak,
    resumeWork,
    endWork
  };
};
