import type { TimeEntryInput, TimeRecord } from "@/types/cloud";

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function displayDate(value: string): string {
  return validDate(value) ? new Date(`${value}T12:00:00`).toLocaleDateString() : value;
}

export function timeMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function intervalMinutes(start: string, end: string): number {
  const minutes = timeMinutes(end) - timeMinutes(start);
  return minutes < 0 ? minutes + 1440 : minutes;
}

export function validateTimeInput(input: TimeEntryInput): string[] {
  const errors: string[] = [];
  if (!validDate(input.work_date)) errors.push("Choose a valid work date.");
  if (!TIME_PATTERN.test(input.start_time) || !TIME_PATTERN.test(input.end_time)) {
    errors.push("Work start and end times are required in HH:MM format.");
    return errors;
  }
  const work = intervalMinutes(input.start_time, input.end_time);
  if (work === 0) errors.push("Work start and end times must differ.");
  if (!Number.isInteger(input.break_minutes) || input.break_minutes < 0 ||
      input.break_minutes >= work) errors.push("Break minutes must be less than the shift duration.");
  if (Boolean(input.ot_start) !== Boolean(input.ot_end)) {
    errors.push("Provide both overtime times, or leave both empty.");
  } else if (input.ot_start && input.ot_end) {
    if (!TIME_PATTERN.test(input.ot_start) || !TIME_PATTERN.test(input.ot_end)) {
      errors.push("Overtime times must use HH:MM format.");
    } else {
      const overtime = intervalMinutes(input.ot_start, input.ot_end);
      const offset = (timeMinutes(input.ot_start) - timeMinutes(input.start_time) + 1440) % 1440;
      if (overtime === 0 || offset < work || offset + overtime > 1440) {
        errors.push("Overtime must follow regular work without overlapping it, within a 24-hour shift.");
      }
    }
  }
  if (input.description.trim().length > 2000) errors.push("Description must be 2,000 characters or fewer.");
  return errors;
}

export function totalTimeHours(input: TimeEntryInput): number {
  if (validateTimeInput(input).length) return 0;
  const overtime = input.ot_start && input.ot_end ? intervalMinutes(input.ot_start, input.ot_end) : 0;
  return Number(((intervalMinutes(input.start_time, input.end_time) - input.break_minutes + overtime) / 60).toFixed(2));
}

export function emptyTimeInput(date = localDate()): TimeEntryInput {
  return { work_date: date, start_time: "", end_time: "", break_minutes: 0, ot_start: "", ot_end: "", description: "" };
}

export function recordTimeInput(record: TimeRecord): TimeEntryInput {
  return {
    work_date: record.work_date,
    start_time: record.start_time?.slice(0, 5) ?? "",
    end_time: record.end_time?.slice(0, 5) ?? "",
    break_minutes: record.break_minutes,
    ot_start: record.ot_start?.slice(0, 5) ?? "",
    ot_end: record.ot_end?.slice(0, 5) ?? "",
    description: record.description ?? "",
  };
}

export function leaveDays(start: string, end: string): number {
  if (!validDate(start) || !validDate(end) || end < start) return 0;
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
}

export function leaveDaysInYear(start: string, end: string, year: number): number {
  return leaveDays(start > `${year}-01-01` ? start : `${year}-01-01`, end < `${year}-12-31` ? end : `${year}-12-31`);
}
