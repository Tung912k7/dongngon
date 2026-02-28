# RESEARCH: Performance Optimization for Dong Ngon

## 1. Animation Performance (Framer Motion)
- **Best Practice**: Use `layout` prop sparingly. Prefer CSS transforms (`x`, `y`, `scale`, `rotate`) over properties that trigger reflow (`width`, `height`, `top`, `left`).
- **Optimization**: Use `LazyMotion` and `domAnimation` features to reduce bundle size if possible.
- **Hardware Acceleration**: Apply `will-change: transform` to complex 3D cards to offload rendering to the GPU.

## 2. Dynamic Scroll Calculations
- **Issue**: `useTransform` in `CumulativeSection.tsx` runs on every scroll tick.
- **Optimization**: Ensure the number of transformed elements is minimal. Use `useSpring` on top of `useScroll` for smoother interpolation with less CPU overhead on mobile.
- **Precision**: Use fixed values for scroll ranges to avoid recalculations.

## 3. Image & Asset Loading
- **Current State**: Using raw colors for book covers.
- **Recommendation**: If using textures, use standard Next.js `<Image />` with `priority` for LCP elements.
- **SVGs**: Use `viewBox` correctly and ensure they are inline for critical UI to avoid extra requests.

## 4. Mobile UX / Performance
- **Touch Responsiveness**: Ensure `active` states don't cause layout shifts. Use `tap` events from Framer Motion for better mobile handling.
- **Viewports**: Optimize `initial` and `whileInView` thresholds to prevent heavy animations from starting until the element is actually visible.
