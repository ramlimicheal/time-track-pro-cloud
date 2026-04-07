## 2024-05-23 - Bundle Size Analysis
**Learning:** `HistoryPage` is significantly larger (~450kB) than other pages, likely due to charting libraries (`recharts`).
**Action:** Always ensure `HistoryPage` is lazy-loaded to prevent bloating the main bundle.
