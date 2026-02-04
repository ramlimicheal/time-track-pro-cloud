## 2024-05-23 - HistoryPage Bundle Size
**Learning:** The `HistoryPage` component is exceptionally large (~450kB parsed) because it statically imports `recharts` via `EnhancedHistoryDashboard` and `TimesheetAnalytics`.
**Action:** Always lazy load `HistoryPage` (and `AdminPage`) to prevent bloating the main bundle for users who don't access these specific features.
