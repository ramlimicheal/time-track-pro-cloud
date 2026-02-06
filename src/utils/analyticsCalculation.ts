import { Timesheet, TimesheetEntry } from "@/types";

export const calculateAnalytics = (timesheets: Timesheet[]) => {
  // Stats
  let totalHours = 0;
  let totalEntries = 0;
  let overtimeHours = 0;
  let workingDays = 0;

  // Monthly Trends Map
  const monthlyData: { [key: string]: { hours: number; days: number; overtime: number } } = {};

  // Status Distribution Map
  // Initialize with 0 to ensure all keys exist in final output even if count is 0
  const statusCount: Record<string, number> = { approved: 0, pending: 0, rejected: 0, draft: 0 };

  // Work Patterns Map
  const patterns: { [hour: string]: number } = {};

  timesheets.forEach(timesheet => {
    const monthKey = `${timesheet.year}-${timesheet.month.toString().padStart(2, '0')}`;

    // Initialize monthly data for this timesheet's month if not exists
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { hours: 0, days: 0, overtime: 0 };
    }

    timesheet.entries.forEach((entry: TimesheetEntry) => {
      const hasHours = entry.totalHours > 0;

      if (hasHours) {
        // Overall Stats
        totalHours += entry.totalHours;
        totalEntries++;
        workingDays++;
        if (entry.totalHours > 8) {
          overtimeHours += entry.totalHours - 8;
        }

        // Monthly Trends
        monthlyData[monthKey].hours += entry.totalHours;
        monthlyData[monthKey].days++;
        if (entry.totalHours > 8) {
          monthlyData[monthKey].overtime += entry.totalHours - 8;
        }

        // Status Distribution
        // statusCount is initialized with all valid keys, but we check just in case
        if (typeof statusCount[entry.status] === 'number') {
          statusCount[entry.status]++;
        } else {
            statusCount[entry.status] = 1;
        }
      }

      // Work Patterns (Independent of totalHours check, based on workStart existence)
      if (entry.workStart) {
        const hour = entry.workStart.split(':')[0];
        patterns[hour] = (patterns[hour] || 0) + 1;
      }
    });
  });

  // Post-process to arrays

  // 1. Overall Stats
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
  const totalPatternsCount = Object.values(patterns).reduce((a, b) => a + b, 0);
  const workPatterns = Object.entries(patterns)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
      percentage: totalPatternsCount > 0 ? ((count / totalPatternsCount) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return { stats, monthlyTrends, statusDistribution, workPatterns };
};
