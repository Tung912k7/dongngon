## Design Specification: Popular Works Realignment

### UI/UX Goal
Ensure the "CÁC TÁC PHẨM PHỔ BIẾN" title and the 3 book cards are all visually centered in the safe area of the screen without getting clipped by the global navbar and top gradient.

### Design Adjustments
1. **Reduce Overall Content Height:** By reducing the vertical gap between the title and the book cards, we preserve screen real-estate.
   - Old Gap: `gap-10 md:gap-16 lg:gap-24`
   - New Gap: `gap-6 md:gap-10 lg:gap-12`
   
2. **Reduce Section Padding:** Minimize the vertical padding inside `PopularContent.tsx`.
   - Old Padding: `py-10 md:py-16`
   - New Padding: `py-6 md:py-8 lg:py-12`

3. **Offset the Flex Center:** By adding `pt-24` (or similar) to the `motion.div` in `CumulativeSection.tsx`, the block centers slightly lower on the screen, matching the visual center when accounting for the `h-32` top gradient overlay.
   - Old `CumulativeSection` container classes: `absolute inset-0 flex flex-col items-center justify-center px-4 md:px-12 lg:px-20`
   - New `CumulativeSection` container classes: `absolute inset-0 flex flex-col items-center justify-center px-4 md:px-12 lg:px-20 pt-[10vh] md:pt-[12vh]`  (Using `vh` to reliably push it down from the mathematical center in relation to viewport size).

### Accessibility
- Ensures visually impaired or low-vision users won't miss the title due to header overlap.
- Improves scan-ability.
