
// Utility functions for time calculations and validations

// Validate time format (HH:MM)
export const isValidTimeFormat = (time: string): boolean => {
  if (!time) return true; // Empty is valid
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

// Calculate hours between two time strings
export const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Handle case where end time is on the next day
  const diffMinutes = endTotalMinutes >= startTotalMinutes 
    ? endTotalMinutes - startTotalMinutes 
    : (24 * 60) - startTotalMinutes + endTotalMinutes;
  
  return Number((diffMinutes / 60).toFixed(2));
};

// Calculate break hours
export const calculateBreakHours = (breakStart: string, breakEnd: string): number => {
  return calculateHours(breakStart, breakEnd);
};

// Calculate total hours from entry times
export const calculateTotalHours = (
  workStart: string,
  workEnd: string,
  breakStart: string,
  breakEnd: string,
  otStart: string,
  otEnd: string
): number => {
  // Calculate regular work hours
  const workHours = calculateHours(workStart, workEnd);
  
  // Calculate break hours
  const breakHours = calculateBreakHours(breakStart, breakEnd);
  
  // Calculate overtime hours
  const otHours = calculateHours(otStart, otEnd);
  
  // Calculate total hours (work hours - break hours + overtime hours)
  const netWorkHours = Math.max(0, workHours - breakHours);
  return netWorkHours + otHours;
};

// Validate timesheet entry
export const validateEntry = (entry: {
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
  otStart: string;
  otEnd: string;
}): boolean => {
  // Check if work start and end times are filled and valid
  if (entry.workStart && entry.workEnd) {
    if (!isValidTimeFormat(entry.workStart) || !isValidTimeFormat(entry.workEnd)) {
      return false;
    }
  }
  
  // Check if break times are both filled or both empty
  if ((entry.breakStart && !entry.breakEnd) || (!entry.breakStart && entry.breakEnd)) {
    return false;
  }
  
  // Check if OT times are both filled or both empty
  if ((entry.otStart && !entry.otEnd) || (!entry.otStart && entry.otEnd)) {
    return false;
  }
  
  // Validate break times if they exist
  if (entry.breakStart && entry.breakEnd) {
    if (!isValidTimeFormat(entry.breakStart) || !isValidTimeFormat(entry.breakEnd)) {
      return false;
    }
  }
  
  // Validate OT times if they exist
  if (entry.otStart && entry.otEnd) {
    if (!isValidTimeFormat(entry.otStart) || !isValidTimeFormat(entry.otEnd)) {
      return false;
    }
  }
  
  return true;
};
