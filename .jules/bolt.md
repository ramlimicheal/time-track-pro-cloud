## 2026-01-30 - [Consolidated Data Processing Pattern]
**Learning:** Found a component (`TimesheetAnalytics`) iterating over the same dataset 4 times synchronously in the render body.
**Action:** Use `useMemo` to consolidate multiple traversals into a single pass (O(4N) -> O(N)) and prevent recalculation on parent re-renders. This pattern is highly effective for dashboard components with derived statistics.
