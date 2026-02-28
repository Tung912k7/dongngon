# Fix Plan: Popular Works Title Cutoff

## 📌 User Request (VERBATIM)
"nội dung bị đẩy lên phía trên quá cao khiến tiêu đề biến mất"

## 🎯 Acceptance Criteria
- [ ] Title "CÁC TÁC PHẨM PHỔ BIẾN" must be visible and not cut off by the top edge or background gradient.
- [ ] The layout of the Popular Block must be centered vertically within its scrolling section.
- [ ] Other sections (About, Contribution) remain unaffected.

## 🛠️ Implementation Plan
1. Open `components/CumulativeSection.tsx`.
2. Locate the wrapper `<motion.div>` for the `PopularContent` block.
3. Replace the `justify-end` and padding classes to `justify-center`.
4. Save verify layout.

## ⏪ Rollback Strategy
Revert the class changes back to `justify-end pb-20 md:pb-32`.
