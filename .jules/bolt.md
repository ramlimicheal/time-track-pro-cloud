# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2024-05-24 - [Route-based Code Splitting]
**Learning:** The application was loading all page components synchronously, including heavy ones like `HistoryPage` (which uses `recharts`), leading to a large initial bundle size.
**Action:** Implemented `React.lazy` and `Suspense` for all secondary routes to split the code into smaller chunks, improving initial load time. Kept `Index` synchronous for optimal LCP.
