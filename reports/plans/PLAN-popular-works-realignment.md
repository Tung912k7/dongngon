# Plan: Popular Works Full Re-alignment

## 📌 User Request (VERBATIM)
"Tiêu đề đã lộ ra 1 ít, nhưng vẫn đang bị chê khuất bởi header, hãy căn chỉnh lại toàn bộ nội dung của popular works section, đảm bảo mọi thành phần đều có thể nhìn thấy rõ ràng và hài hoà."

## 🎯 Acceptance Criteria
- [ ] Title "CÁC TÁC PHẨM PHỔ BIẾN" must be fully visible below the Top Header and Top Gradient.
- [ ] The cards and bottom section label must remain fully visible and harmoniously placed.
- [ ] Overall layout must not be squished but reduced enough to fit shorter desktop resolutions.

## 🛠️ Implementation Plan
1. Open `components/CumulativeSection.tsx`.
   - In the Popular Block `<motion.div>`: add `pt-[10vh] md:pt-[12vh]` to shift the mathematical flex-center downward, offsetting the visual weight of the top headers.
2. Open `components/popular/PopularContent.tsx`.
   - Alter main container padding from `py-10 md:py-16` to `py-6 md:py-8 lg:py-12`.
   - Alter main vertical gap from `gap-10 md:gap-16 lg:gap-24` to `gap-6 md:gap-10 lg:gap-12`.
3. Save, wait for Live Preview, and test via browser automation.

## ⏪ Rollback Strategy
Revert the gap and padding changes back to their previous heights and remove the `pt-[vh]` alignment hack.
