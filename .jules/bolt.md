## 2024-05-23 - HistoryPage Bundle Size
**Learning:** The `HistoryPage` component contributes significantly (~450kB) to the bundle size, likely due to the `recharts` library.
**Action:** Implemented route-based code splitting to defer loading of this heavy component until needed. Future optimizations could explore lighter charting alternatives or more granular splitting of the charting library if possible.
