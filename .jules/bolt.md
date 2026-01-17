## 2024-05-22 - Route-based Code Splitting Impact
**Learning:** `HistoryPage` contains `recharts` which contributes ~450kB to the bundle size. Code splitting this route significantly reduces the initial load for other users.
**Action:** Always verify bundle analysis when using heavy visualization libraries like `recharts`.
