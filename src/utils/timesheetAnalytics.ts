import { Timesheet, TimesheetEntry } from "@/types";

export interface AnalyticsData {
  stats: {
    totalHours: number;
    totalEntries: number;
    overtimeHours: number;
    workingDays: number;
    averageDaily: number;
    productivity: number;
  };
  monthlyTrends: {
    month: string;
    hours: number;
    days: number;
    overtime: number;
    average: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    percentage: string;
  }[];
  workPatterns: {
    hour: string;
    count: number;
    percentage: string;
  }[];
}

export const analyzeTimesheets = (timesheets: Timesheet[]): AnalyticsData => {
  let totalHours = 0;
  let totalEntries = 0;
  let overtimeHours = 0;
  let workingDays = 0;

  const monthlyData: { [key: string]: { hours: number; days: number; overtime: number } } = {};
  const statusCount: Record<string, number> = { approved: 0, pending: 0, rejected: 0, draft: 0 };
  const patterns: { [hour: string]: number } = {};

  timesheets.forEach(timesheet => {
    const monthKey = `${timesheet.year}-${timesheet.month.toString().padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { hours: 0, days: 0, overtime: 0 };
    }

    timesheet.entries.forEach((entry: TimesheetEntry) => {
      if (entry.totalHours > 0) {
        // Overall Stats
        totalHours += entry.totalHours;
        totalEntries++;
        workingDays++;
        if (entry.totalHours > 8) {
          const ot = entry.totalHours - 8;
          overtimeHours += ot;

          // Monthly Overtime
          monthlyData[monthKey].overtime += ot;
        }

        // Monthly Trends
        monthlyData[monthKey].hours += entry.totalHours;
        monthlyData[monthKey].days++;

        // Status Distribution
        if (statusCount[entry.status] !== undefined) {
          statusCount[entry.status]++;
        }

        // Work Patterns
        if (entry.workStart) {
          const hour = entry.workStart.split(':')[0];
          if (hour) {
             patterns[hour] = (patterns[hour] || 0) + 1;
          }
        }
      }
    });
  });

  // Process Results

  // 1. Stats
  const stats = {
    totalHours,
    totalEntries,
    overtimeHours,
    workingDays,
    averageDaily: workingDays > 0 ? totalHours / workingDays : 0,
    productivity: Math.min(100, (totalHours / (workingDays * 8)) * 100)
  };

  // 2. Monthly Trends
  const monthlyTrends = Object.entries(monthlyData)
    .map(([key, data]) => ({
      month: key,
      ...data,
      average: data.days > 0 ? data.hours / data.days : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // 3. Status Distribution
  const totalStatusCount = Object.values(statusCount).reduce((a, b) => a + b, 0);
  const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    percentage: totalStatusCount > 0 ? ((count / totalStatusCount) * 100).toFixed(1) : "0.0"
  }));

  // 4. Work Patterns
  const totalPatterns = Object.values(patterns).reduce((a, b) => a + b, 0);
  const workPatterns = Object.entries(patterns)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
      percentage: totalPatterns > 0 ? ((count / totalPatterns) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return {
    stats,
    monthlyTrends,
    statusDistribution,
    workPatterns
  };
};
