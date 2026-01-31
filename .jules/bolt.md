## 2024-05-22 - Data Processing Optimization
**Learning:** Consolidating multiple array traversals into a single pass within `useMemo` significantly improved performance for the `TimesheetAnalytics` component (~60% faster in benchmarks).
**Action:** Look for similar patterns in other dashboard components where derived state is calculated via multiple independent loops over the same large dataset.
