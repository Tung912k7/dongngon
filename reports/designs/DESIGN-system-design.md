## Design: UI Rendering & Performance (dongngon)

### Overview
This design prioritizes a "premium feel" through high-performance rendering, smooth transitions, and stable layouts. We are moving away from multi-user collaboration to specialize in a highly optimized single-user experience.

### 🏛️ Proposed System Architecture (Pivoted)

#### 1. Rendering Strategy: Virtualization & Windowing
- **Component**: `Feed.tsx` / `DongNgonClient.tsx`.
- **Logic**: As the "Kho tàng" grows, rendering 100+ complex cards in a grid causes DOM bloat.
- **Implementation**: Integrate **react-window** or **@tanstack/react-virtual** to only render cards currently in the viewport.

#### 2. Layout Stability: Skeleton Loaders
- **Problem**: Content jumping when works load via SSR hydration or Supabase fetch.
- **Implementation**: 
  - Create `WorkCardSkeleton.tsx` matching the exact dimensions of `WorkCard.tsx`.
  - Display skeletons during `isLoading` states in `Zustand WorkStore`.

#### 3. State Management: Refinement
- **Zustand Usage**: Keep the existing stores but remove "RealtimeDelta" emitters.
- **Optimization**: Use `shallow` equality checks in store selectors to prevent unnecessary re-renders of the `Header` or `Footer` when items in the `WorkStore` update.

#### 4. Image Optimization & CLS
- **Action**: Ensure all component images (e.g., user avatars, work highlights) use `next/image` with predefined `aspect-ratio` to prevent Layout Shifts.

### 🚀 Scaling Strategy (Pivoted)
- **Bundle Optimization**: Use `dynamic()` imports for heavy components like `CreateWorkModal` so they aren't loaded until the user clicks "Tạo".
- **Interaction**: Implement **Framer Motion** `LayoutGroup` for smooth transitions when filtering the list.

### Responsive Behavior
| Breakpoint | Behavior |
| --- | --- |
| Mobile (<640px) | Single column virtualization with simplified Skeleton cards. |
| Desktop (>1024px) | 3-column grid virtualization with rich interactive hover states. |
