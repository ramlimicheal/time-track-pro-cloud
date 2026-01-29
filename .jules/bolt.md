## 2024-05-23 - Analytics Loop Consolidation
**Learning:** Analytics components often perform multiple passes over the same dataset to calculate different metrics. These can be consolidated into a single pass within `useMemo` to significantly reduce complexity (e.g., O(4N) -> O(N)).
**Action:** Inspect `src/components/admin/TimesheetAnalytics.tsx` for similar optimization opportunities.
