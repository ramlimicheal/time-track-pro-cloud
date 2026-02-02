import { Timesheet, TimesheetEntry } from "@/types";

export interface TimesheetAnalyticsData {
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

export const calculateTimesheetAnalytics = (timesheets: Timesheet[]): TimesheetAnalyticsData => {
  // Initialize accumulators
  let totalHours = 0;
  let totalEntries = 0;
  let overtimeHours = 0;
  let workingDays = 0;

  const monthlyData: { [key: string]: { hours: number; days: number; overtime: number } } = {};
  const statusCount = { approved: 0, pending: 0, rejected: 0, draft: 0 };
  const workPatternsMap: { [hour: string]: number } = {};

  // Single pass through data
  timesheets.forEach(timesheet => {
    const monthKey = `${timesheet.year}-${timesheet.month.toString().padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { hours: 0, days: 0, overtime: 0 };
    }

    timesheet.entries.forEach((entry: TimesheetEntry) => {
      // Only count entries with hours for most stats
      if (entry.totalHours > 0) {
        // Overall stats
        totalHours += entry.totalHours;
        totalEntries++;
        workingDays++;

        if (entry.totalHours > 8) {
          const overtime = entry.totalHours - 8;
          overtimeHours += overtime;

          // Monthly overtime
          monthlyData[monthKey].overtime += overtime;
        }

        // Monthly stats
        monthlyData[monthKey].hours += entry.totalHours;
        monthlyData[monthKey].days++;

        // Status distribution
        if (statusCount[entry.status] !== undefined) {
          statusCount[entry.status]++;
        }
      }

      // Work patterns (independent of totalHours > 0 check? Original code checked workStart)
      // Original: if (entry.workStart) ...
      if (entry.workStart) {
        const hour = entry.workStart.split(':')[0];
        workPatternsMap[hour] = (workPatternsMap[hour] || 0) + 1;
      }
    });
  });

  // Calculate derived stats
  const averageDaily = workingDays > 0 ? totalHours / workingDays : 0;
  const productivity = Math.min(100, (totalHours / (workingDays * 8)) * 100);

  // Transform monthly trends
  const monthlyTrends = Object.entries(monthlyData)
    .map(([key, data]) => ({
      month: key,
      ...data,
      average: data.days > 0 ? data.hours / data.days : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Transform status distribution
  const totalStatusCount = Object.values(statusCount).reduce((a, b) => a + b, 0);
  const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    percentage: totalStatusCount > 0 ? ((count / totalStatusCount) * 100).toFixed(1) : "0.0"
  }));

  // Transform work patterns
  const totalWorkPatterns = Object.values(workPatternsMap).reduce((a, b) => a + b, 0);
  const workPatterns = Object.entries(workPatternsMap)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
      percentage: totalWorkPatterns > 0 ? ((count / totalWorkPatterns) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return {
    stats: {
      totalHours,
      totalEntries,
      overtimeHours,
      workingDays,
      averageDaily,
      productivity
    },
    monthlyTrends,
    statusDistribution,
    workPatterns
  };
};
