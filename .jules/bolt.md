## 2026-02-01 - Route-based Code Splitting
**Learning:** Heavy libraries like `recharts` in secondary pages (e.g., `HistoryPage`) can bloat the main bundle significantly (480KB -> 930KB+). Importing them synchronously in `App.tsx` forces them into the initial load.
**Action:** Always use `React.lazy` and `Suspense` for pages that are not part of the critical rendering path (e.g., dashboard, admin panels), keeping only the landing page synchronous for optimal FCP.
