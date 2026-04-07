## 2024-05-24 - Route-Based Code Splitting Impact
**Learning:** The `HistoryPage` route contributes significantly to the bundle size (~450kB) primarily due to the `recharts` library dependency.
**Action:** Always lazy load pages with heavy charting libraries (`React.lazy`) to avoid bloating the initial bundle. The `index` chunk size was effectively optimized by isolating `HistoryPage`.
