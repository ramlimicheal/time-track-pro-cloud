## 2026-01-14 - Route-Based Code Splitting
**Learning:** Initial bundle size was large because all pages were imported statically in `App.tsx`. Implementing `React.lazy` and `Suspense` is a high-impact, low-risk optimization for this architecture.
**Action:** Always check `App.tsx` for static imports of page components in Vite apps.
