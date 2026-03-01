# PLAN: UI Rendering & Performance Optimization

## Core Objective
Transform the "Kho tàng" (Works Gallery) into a high-performance interactive experience by implementing virtualization, skeleton loaders, and bundle optimizations.

## Steps

### 🚶 1. Setup & Dependencies
- [ ] Install `@tanstack/react-virtual` for grid virtualization.
- [ ] Install `clsx` and `tailwind-merge` for cleaner dynamic styling.

### 🚶 2. Skeleton Loaders for Stability
- [ ] Create `components/WorkCardSkeleton.tsx`:
    - Match `WorkCard.tsx` padding, height, and border radius.
    - Use animated gray blocks for title, author, and tags.
- [ ] Integrate into `DongNgonClient.tsx`:
    - Show 6 skeletons when `isLoading` is true.

### 🚶 3. Grid Virtualization
- [ ] Implement `useVirtualizer` in `DongNgonClient.tsx`.
- [ ] Configure to handle responsive grid (1 col mobile, 3 col desktop).
- [ ] Virtualize the main interactive list to maintain < 50 DOM nodes regardless of item count.

### 🚶 4. Component Splitting & Selectors
- [ ] Convert `CreateWorkModal` and `TableFilter` to `dynamic()` imports with `{ ssr: false }`.
- [ ] Update store hooks to use specific selectors for performance (avoiding full store re-renders on prop changes).

### 🚶 5. UX Polish
- [ ] Add `Framer Motion` animations for filtered list entries.
- [ ] Ensure `next/image` usage in cards has explicit `width`/`height` or aspect-ratio to kill Layout Shift.

## Acceptance Criteria
- [ ] No layout shift when works are fetching (`CLS < 0.1`).
- [ ] DOM size remains constant when scrolling through hundreds of works.
- [ ] Smooth 60fps filtering animation.
