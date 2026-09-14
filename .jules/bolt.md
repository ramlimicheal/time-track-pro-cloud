## 2024-05-24 - App.tsx Static Imports Bottleneck
**Learning:** `src/App.tsx` uses static imports for all page components (`HistoryPage`, `AdminPage`, etc.), causing the main bundle to be very large (~1.1MB) as it includes all dependencies (like `recharts`) from all pages.
**Action:** When optimizing this codebase, prioritize lazy loading heavy components *inside* pages or refactor `App.tsx` to use `React.lazy` for routes to enable true route-based code splitting.
