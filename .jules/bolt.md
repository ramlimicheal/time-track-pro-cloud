## 2024-05-23 - Memoization of Heavy Visualizations
**Learning:** Visualization components (using Recharts) often perform heavy data transformation (sorting, aggregating) on every render. Even if props are stable, parent re-renders trigger re-calculation if not memoized.
**Action:** Always wrap expensive data transformation logic in `useMemo` dependent on the input data props.
