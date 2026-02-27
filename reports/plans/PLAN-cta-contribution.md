# Implementation Plan: Fix CTA & Redesign Contribution Section

## 📌 User Request (VERBATIM)
> @[/cook]:focus the cta button didnt work and redesign contribution section 

## 🎯 Acceptance Criteria (Derived from User Request)
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | CTA button must work | Click the Hero CTA button and ensure it navigates correctly |
| AC2 | Contribution section redesigned | Visually inspect the Contribution section in the Cumulative block |

## 📋 Context Summary
**Architecture**: Next.js App Router, Tailwind CSS, Framer Motion.
**Patterns**: Monochromatic (Black `#07000B`, White `#F5F5F5`). Literary aesthetic, large typography, negative space.
**Constraints**: Keep the wording of the Contribution section the same, but modernize its layout.

## Overview
1. Convert `PrimaryButton` in `HeroSection.tsx` to `LinkedButton` so it correctly functions as a link.
2. Refactor `ContributionContent.tsx` to remove clunky backgrounds/borders and use elegant typographic hierarchy aligned with the new literary aesthetic.

## Prerequisites
- [x] Context and requirements clear.

## Phase 1: Fix CTA Button
### Tasks
- [ ] Task 1.1: Update HeroSection.tsx
  - Agent: `frontend-engineer`
  - File(s): `components/HeroSection.tsx`
  - Acceptance: AC1
  - Verification: `PrimaryButton` changed to `LinkedButton` with `href="/dong-ngon"`.

## Phase 2: Redesign Contribution Section
### Tasks
- [ ] Task 2.1: Update ContributionContent.tsx
  - Agent: `frontend-engineer`
  - File(s): `components/contribution/ContributionContent.tsx`
  - Acceptance: AC2
  - Verification: Component uses `font-ganh` for headers, minimal borders (`border-white/20`), removes `bg-white/5` boxes.

## Risks
| Risk | Impact | Mitigation | Rollback |
|------|--------|------------|----------|
| Broken link | Low | Ensure `LinkedButton` is imported properly | Revert `HeroSection.tsx` |

## Implementation Notes
- For the contribution section, use a grid or flex layout with generous padding. Highlight the rules using typographic weight and elegant left-borders instead of chunky background boxes.
