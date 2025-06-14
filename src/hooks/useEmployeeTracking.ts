
import { useEffect } from "react";
import { liveTrackingManager } from "@/utils/liveTracking";

export const useEmployeeTracking = (employeeId: string, employeeName: string) => {
  useEffect(() => {
    // Employee comes online
    liveTrackingManager.employeeOnline(employeeId, employeeName);

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        liveTrackingManager.updateActivity(employeeId, "Away", "Browser tab inactive");
      } else {
        liveTrackingManager.updateActivity(employeeId, "Active", "Browser tab active");
      }
    };

    // Track mouse and keyboard activity
    let activityTimeout: NodeJS.Timeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      liveTrackingManager.updateActivity(employeeId, "Active", "User interaction detected");
      
      // Set idle timeout after 5 minutes of no activity
      activityTimeout = setTimeout(() => {
        liveTrackingManager.updateActivity(employeeId, "Idle", "No user interaction");
      }, 5 * 60 * 1000);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);

    // Initial activity
    handleActivity();

    // Cleanup on unmount (employee goes offline)
    return () => {
      liveTrackingManager.employeeOffline(employeeId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
      clearTimeout(activityTimeout);
    };
  }, [employeeId, employeeName]);

  // Helper function to update specific activities
  const trackActivity = (activity: string, details?: string) => {
    liveTrackingManager.updateActivity(employeeId, activity, details);
  };

  // Helper function to update work hours
  const trackWorkHours = (hours: number) => {
    liveTrackingManager.updateWorkHours(employeeId, hours);
  };

  return { trackActivity, trackWorkHours };
};
