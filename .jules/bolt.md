## 2024-05-23 - TimesheetAnalytics Optimization
**Learning:** Consolidating multiple data traversals into a single pass within `useMemo` significantly reduces computational overhead for data-intensive components.
**Action:** When calculating multiple derived statistics from a single dataset, always attempt to compute them in a single iteration to minimize O(n) operations.
