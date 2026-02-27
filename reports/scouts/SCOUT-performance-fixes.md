# SCOUT: Next.js Performance & Core Web Vitals Optimization

## Existing Architecture
- **Root Layout (`app/layout.tsx`)**: Imports several global wrappers synchronously: `CSPostHogProvider`, `SmoothScroll`, `Header`, and `GuideNotification`. 
- **Providers (`app/providers.tsx`)**: Imports `posthog-js` statically at the top of the file, forcing Next.js to include this massive library (~100kb+) in the initial client bundle for all routes, even if event tracking is debounced.
- **Guide Notification (`components/GuideNotification.tsx`)**: Imports `framer-motion` (a very heavy animation library). Because it's included synchronously in `layout.tsx`, `framer-motion` blocks the initial render of the entire application.

## Integration Points
1. **`app/layout.tsx`**: 
   - `GuideNotification` is not needed immediately on first paint. It should be lazily loaded to avoid shipping `framer-motion` in the main bundle chunk.
2. **`components/SmoothScroll.tsx`**:
   - `lenis` is used globally but creates a network dependency. Evaluating if it can be deferred.
3. **`app/providers.tsx`**:
   - `posthog-js` must be evaluated. In App Router, we should dynamically import libraries that aren't critical to layout rendering.
4. **`package.json`**:
   - The reported "Legacy JS" is usually an artifact of polyfills being shipped or Next.js misconfiguration.

## Conclusion
The root cause for the "Unused JS" (150kb) and "Render Blocking" delays originate from rendering heavy, non-critical JS payloads (like PostHog and Framer Motion) synchronously at the root level.
