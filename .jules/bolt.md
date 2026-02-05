## 2024-05-24 - TimesheetAnalytics Performance Refactor
**Learning:** Heavy data processing (O(4N)) inside React component render body runs on every render, causing performance degradation as data grows.
**Action:** Extracted logic to `src/utils/timesheetAnalytics.ts` (O(N) single pass) and used `useMemo` in component. Always memoize expensive array iterations in data visualization components.
