
import { TimesheetEntry } from "@/types";
import { calculateTotalHours, isValidTimeFormat } from "./timeUtils";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateTimesheetEntry = (entry: TimesheetEntry): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if work times are provided
  if (!entry.workStart && !entry.workEnd) {
    // Empty entry is valid
    return { isValid: true, errors: [], warnings: [] };
  }

  // Validate work times
  if (entry.workStart && !isValidTimeFormat(entry.workStart)) {
    errors.push("Invalid work start time format. Use HH:MM format.");
  }

  if (entry.workEnd && !isValidTimeFormat(entry.workEnd)) {
    errors.push("Invalid work end time format. Use HH:MM format.");
  }

  // Check if both work start and end are provided
  if (entry.workStart && !entry.workEnd) {
    errors.push("Work end time is required when work start time is provided.");
  }

  if (!entry.workStart && entry.workEnd) {
    errors.push("Work start time is required when work end time is provided.");
  }

  // Validate break times
  if (entry.breakStart && !isValidTimeFormat(entry.breakStart)) {
    errors.push("Invalid break start time format. Use HH:MM format.");
  }

  if (entry.breakEnd && !isValidTimeFormat(entry.breakEnd)) {
    errors.push("Invalid break end time format. Use HH:MM format.");
  }

  // Check break time consistency
  if (entry.breakStart && !entry.breakEnd) {
    errors.push("Break end time is required when break start time is provided.");
  }

  if (!entry.breakStart && entry.breakEnd) {
    errors.push("Break start time is required when break end time is provided.");
  }

  // Validate overtime
  if (entry.otStart && !isValidTimeFormat(entry.otStart)) {
    errors.push("Invalid overtime start time format. Use HH:MM format.");
  }

  if (entry.otEnd && !isValidTimeFormat(entry.otEnd)) {
    errors.push("Invalid overtime end time format. Use HH:MM format.");
  }

  // Check OT time consistency
  if (entry.otStart && !entry.otEnd) {
    errors.push("Overtime end time is required when overtime start time is provided.");
  }

  if (!entry.otStart && entry.otEnd) {
    errors.push("Overtime start time is required when overtime end time is provided.");
  }

  // Logical validations (only if times are valid)
  if (errors.length === 0) {
    // Check if work end is after work start
    if (entry.workStart && entry.workEnd) {
      const workHours = calculateTotalHours(entry.workStart, entry.workEnd, "", "", "", "");
      if (workHours <= 0) {
        errors.push("Work end time must be after work start time.");
      }
      
      // Check for excessive hours
      if (workHours > 16) {
        warnings.push("Work hours exceed 16 hours. Please verify.");
      }
    }

    // Check break times are within work hours
    if (entry.workStart && entry.workEnd && entry.breakStart && entry.breakEnd) {
      const workStart = timeToMinutes(entry.workStart);
      const workEnd = timeToMinutes(entry.workEnd);
      const breakStart = timeToMinutes(entry.breakStart);
      const breakEnd = timeToMinutes(entry.breakEnd);

      if (breakStart < workStart || breakStart > workEnd) {
        errors.push("Break start time must be within work hours.");
      }

      if (breakEnd < workStart || breakEnd > workEnd) {
        errors.push("Break end time must be within work hours.");
      }

      if (breakEnd <= breakStart) {
        errors.push("Break end time must be after break start time.");
      }
    }

    // Check total hours calculation
    const totalHours = calculateTotalHours(
      entry.workStart,
      entry.workEnd,
      entry.breakStart,
      entry.breakEnd,
      entry.otStart,
      entry.otEnd
    );

    if (totalHours < 0) {
      errors.push("Total hours cannot be negative.");
    }

    if (totalHours > 24) {
      errors.push("Total hours cannot exceed 24 hours in a day.");
    }

    // Warning for unusual patterns
    if (totalHours > 12) {
      warnings.push("Total hours exceed 12. Please verify all times are correct.");
    }

    if (entry.workStart && entry.workEnd && !entry.breakStart && totalHours > 6) {
      warnings.push("Consider adding a break for shifts longer than 6 hours.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const validateTimesheet = (entries: TimesheetEntry[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  entries.forEach((entry, index) => {
    const result = validateTimesheetEntry(entry);
    
    result.errors.forEach(error => {
      allErrors.push(`${entry.date}: ${error}`);
    });
    
    result.warnings.forEach(warning => {
      allWarnings.push(`${entry.date}: ${warning}`);
    });
  });

  // Check for duplicate dates
  const dates = entries.map(e => e.date).filter(date => date);
  const duplicates = dates.filter((date, index) => dates.indexOf(date) !== index);
  
  if (duplicates.length > 0) {
    allErrors.push(`Duplicate dates found: ${duplicates.join(', ')}`);
  }

  // Check for missing consecutive days (warning only)
  const workDays = entries.filter(e => e.totalHours > 0);
  if (workDays.length > 0) {
    const totalHours = workDays.reduce((sum, e) => sum + e.totalHours, 0);
    if (totalHours < 20) {
      allWarnings.push("Total work hours for the period seems low. Please verify.");
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};
