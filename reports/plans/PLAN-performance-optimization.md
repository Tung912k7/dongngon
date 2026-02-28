# PLAN: Performance Optimization Implementation

## Goal
Improve Lighthouse scores and user-perceived performance for both desktop and mobile.

## Phase 1: CumulativeSection Optimization
- [ ] Refactor `useTransform` to use more efficient thresholds.
- [ ] Add `will-change-transform` and `will-change-opacity` only when sections are near viewport.
- [ ] Ensure `zIndex` transitions don't cause flicker on mobile.

## Phase 2: PopularContent Refinement
- [ ] Implement `whileTap` for mobile to replace or enhance `whileHover`.
- [ ] Optimize SVG star icon (remove unnecessary attributes).
- [ ] Use `line-clamp` more efficiently to avoid layout recalculations for long titles.
- [ ] Implement a simple loading skeleton state to prevent layout shift during Supabase fetch.

## Phase 3: Global Optimizations
- [ ] Check `globals.css` for any heavy shadow or blur rules that can be simplified.
- [ ] Verify that 3D transforms are hardware accelerated.

## Verification / Acceptance Criteria
- [ ] No scrolling lag on simulated mobile devices.
- [ ] Visual consistency maintained while reducing CSS complexity.
- [ ] Hydration is fast and clean.
