# Implementation Plan: Landing Page Redesign

## 📌 User Request (VERBATIM)
> @[/cook]:focus

(Implied from earlier request: "Map out a complete Component Architecture & Design Token plan for the landing page redesign using UI/UX design intelligence." and "Continue" with the implementation)

## 🎯 Acceptance Criteria (Derived from User Request)
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | Component architecture implemented | Check `app/page.tsx` and new components |
| AC2 | Design tokens implemented | Check `tailwind.config.ts` and `globals.css` |
| AC3 | Hero section has primary CTA and integrated search | Manual visual check on `localhost:3000` |
| AC4 | Micro-animations and transition handled | Check hover states and scroll behavior |

## 📋 Context Summary
**Architecture**: Next.js App Router. Components in `components/`, styling in `globals.css` and `tailwind.config.ts`.
**Patterns**: Monochromatic (Natural Black `#07000B`, White Smoke `#F5F5F5`). Typographic hierarchy using `font-ganh` for headings, `font-be-vietnam` for body. Pill-shaped (`rounded-full`) or `rounded-2xl` interactive elements.
**Constraints**: Must maintain existing functionality of Search and Popular Works while upgrading the UI to a premium minimalist literature aesthetic. Use Server Components where possible, Client Components for interactivity.

## Overview
Develop the redesigned landing page for Đồng Ngôn, establishing a clear Hero section, updating the global design tokens, and polishing the Cumulative Section with improved typography, spacing, and micro-interactions.

## Prerequisites
- [x] Design specifications completed and reviewed.
- [ ] Ensure local dev server is running (already running on port 3000).

## Phase 1: Design Tokens & Base Styles Update
### Tasks
- [ ] Task 1.1: Update Typography & Colors
  - Agent: `frontend-engineer`
  - File(s): `tailwind.config.ts`, `app/globals.css`
  - Acceptance: AC2 (Design tokens implemented)
  - Verification: Check tailwind config for correct color codes and `globals.css` for font classes.

### Exit Criteria
- [ ] Tailwind theme reflects the exact monochromatic palette and typography fonts are correctly mapped.

## Phase 2: Core Components Implementation
### Tasks
- [ ] Task 2.1: Implement Button & Interactive Tokens
  - Agent: `frontend-engineer`
  - File(s): `components/PrimaryButton.tsx` (new/updated), `components/SearchBar.tsx`
  - Acceptance: AC4 (Micro-animations and transition handled)
  - Verification: Elements use `rounded-full`, proper hover shadows, and `scale` transitions.

- [ ] Task 2.2: Refactor WorkCard
  - Agent: `frontend-engineer`
  - File(s): `components/WorkCard.tsx`
  - Acceptance: AC1, AC4
  - Verification: Cards use `rounded-2xl`, standard padding, and hover lift effects.

### Exit Criteria
- [ ] Reusable components (Buttons, Search, Cards) match specifications.

## Phase 3: Page Sections Assembly
### Tasks
- [ ] Task 3.1: Build Hero Section
  - Agent: `frontend-engineer`
  - File(s): `components/HeroSection.tsx`
  - Acceptance: AC1, AC3
  - Verification: Full height, contains "ĐỒNG NGÔN" title, "Bắt Đầu Viết" CTA, and integrated Search component.

- [ ] Task 3.2: Polish Cumulative Section & Transition
  - Agent: `frontend-engineer`
  - File(s): `components/CumulativeSection.tsx`, `app/page.tsx`
  - Acceptance: AC1, AC4
  - Verification: Text size increased for intro, Vietnamese pattern styling integrated correctly, transition from white Hero to black Cumulative handled smoothly.

### Exit Criteria
- [ ] Landing page renders correctly without visual glitches and matches the design intent.

## Risks
| Risk | Impact | Mitigation | Rollback |
|------|--------|------------|----------|
| UI Breakage in other pages | Medium | Tokens are mostly non-destructive enhancements (spacing/radius). | `git restore tailwind.config.ts components/` |
| Contrast accessibility issues | High | Enforce STRICT usage of the defined white and black constants. | Manually adjust hex codes back. |

## Rollback Strategy
If implementation drastically breaks the site layout or compilation:
1. Revert changes to `tailwind.config.ts`, `app/globals.css`, and modified components in `components/`.
2. Clear Next.js cache (`.next/`).

## Implementation Notes
Focus heavily on the visual quality (margins, paddings, line-heights, and exact hex codes). The design is minimal, so execution perfection is what makes it feel premium.
- Use `backdrop-blur` for floating elements.
- Do NOT use generic placeholder text in the final Hero.
- Assume the backend/data-fetching logic for Popular Works remains unchanged; only touch the UI wrapper and styling.
