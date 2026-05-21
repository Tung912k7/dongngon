# Homepage Redesign Plan

## 📌 User Request (VERBATIM)

> @[/ui-design-system]@[/ux-researcher-designer]@[/frontend-design]@[/plan-writing]Using browser_subgent, view and analyze the current homepage design and create a redesign plan. The current problem: While the current homepage is well-designed, it remains vague and confusing for users, who may not understand the meaning and purpose of the website or its value proposition.

## 🎯 Goal

Clarify the purpose of "Đồng ngôn" immediately upon landing. Elevate the core value proposition ("one sentence per person") to the hero section, reduce cognitive load, and provide a clear first action while preserving the project's bold visual identity.

## 📋 Context & Problems

**Analysis Findings**: The current hero subtitle is highly abstract and written in hard-to-read ALL CAPS. The core feature (collaborative writing where each person contributes one sentence) is buried in a lower "Story" section. CTAs like "BẮT ĐẦU" lack context. There is no quick "how it works" microflow.
**Aesthetic Direction**: Neo-Brutalist minimalist with traditional Vietnamese motifs. Focus on extreme intentionality in typography and spatial composition (Primary: Black/White, Accent: Literary Gold `#C49A4B`). Font pairing: `Ganh` for wordmark, `Be Vietnam Pro` for body.

## 📝 Tasks & Specifications

- [ ] **Task 1: Update Hero Section Copy & Header**
  - **Action**: Replace abstract hero text with a 1-line value proposition (e.g., "Nơi nhiều người nối chữ — cùng viết nên tác phẩm chung.") and a clarifier ("Tham gia bằng một câu, tiếp nối tác phẩm..."). Use sentence/title case. Add a subtle tagline/badge to the Header: "Cộng tác sáng tác" and a persistent "Tạo" button.
  - **Verify**: Hero copy clearly states the mechanic in readable casing (`Be Vietnam Pro` min 16px). Header includes the persistent action.

- [ ] **Task 2: Improve Hero CTAs**
  - **Action**: Update CTAs. Primary: `Bắt đầu` (include tooltip/aria-label: "Tạo tác phẩm mới / tham gia tác phẩm có sẵn"). Secondary: `Hướng dẫn`.
  - **Verify**: Buttons have 44x44 touch targets on mobile, visible focus outlines, and describe exact actions.

- [ ] **Task 3: Introduce "How it Works" Microflow Above-the-Fold**
  - **Action**: Add a 3-step inline row under the hero: 1. Chọn bắt đầu (Bắt đầu một câu hoặc tham gia), 2. Viết một dòng (Thêm câu, câu thơ...), 3. Xem thành phẩm (Mọi người tiếp nối...).
  - **Verify**: The visual is immediately visible, minimal icons, and clearly communicates the app's mechanism.

- [ ] **Task 4: Surface Featured Works (CumulativeSection)**
  - **Action**: Surface 3–6 featured works with thumbnails, short excerpt, contributor count, and metrics (stories | contributors | lines). Add CTA below: `Khám phá kho tàng`.
  - **Verify**: Displayed in a card grid (2 columns on mobile stacked) acting as orientation aids and social proof.

- [ ] **Task 5: Cohesive Aesthetic & Accessibility**
  - **Action**: Unify the light grid paper transition. Ensure tagline contrast meets WCAG AA (>= 4.5:1). Darken text if needed on white. Add skip-to-content anchor.
  - **Verify**: Scrolling is seamless, contrast is valid, keyboard navigation works via focus outlines.

## 📊 Metrics & Success Criteria

- **Primary**: Increase new-user CTA click-through-rate (CTR) by 30% in first 2 weeks.
- **Secondary**: Decrease bounce rate on homepage by 15%.
- **Track**: Clicks on `Bắt đầu`, clicks on `Hướng dẫn`, time-to-first-contribution, featured card CTR.

## ✅ Done When

- [ ] A new visitor immediately understands that Đồng ngôn is a collaborative writing platform.
- [ ] Hero copy and `HowItWorks` component are implemented and clear.
- [ ] Accessibility checklist (contrast, focus states, touch sizes, aria-labels) is met.
- [ ] Readability issues (ALL CAPS blocks) are resolved.
