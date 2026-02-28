# Implementation Plan: Fix Title Inconsistency

## 📌 User Request (VERBATIM)
> where is the title "Các tác phẩm phổ biến"?
> /fix:hard

## 🎯 Acceptance Criteria (Derived from User Request)
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | The title "Các tác phẩm phổ biến" is displayed in the active UI. | Visually verify the title on the homepage. |
| AC2 | The orphaned component `PopularWorksSection.tsx` is addressed. | Check if file is removed or renamed to avoid confusion. |

## 📋 Context Summary
**Architecture**: Next.js App Router. Sections are modularized in `components/`.
**Patterns**: Scrolling sections in `CumulativeSection.tsx`.
**Constraints**: Keep the design consistent with `PopularContent.tsx`.

## Overview
Update the active `PopularContent.tsx` component to use the preferred title "Các tác phẩm phổ biến" and remove the orphaned `PopularWorksSection.tsx`.

## Phase 1: Implementation
### Tasks
- [ ] Task 1.1: Update title in `PopularContent.tsx`.
  - Agent: `frontend-engineer`
  - File(s): `components/popular/PopularContent.tsx`
  - Acceptance: Change "Các tác phẩm nổi tiếng" (line 61) to "Các tác phẩm phổ biến".
  - Verification: `grep` search confirms the updated string.
- [ ] Task 1.2: Remove orphaned component `PopularWorksSection.tsx`.
  - Agent: `devops-engineer`
  - File(s): `components/PopularWorksSection.tsx`
  - Acceptance: Component file is deleted as it's not used elsewhere.
  - Verification: `ls components/PopularWorksSection.tsx` fails.

### Exit Criteria
- [ ] "Các tác phẩm phổ biến" is used in the codebase in the active component.
- [ ] `PopularWorksSection.tsx` no longer exists.

## Risks
| Risk | Impact | Mitigation | Rollback |
|------|--------|------------|----------|
| User wanted the design of `PopularWorksSection` | L | Verify with user before final delete | Restore using `git checkout` |

## Rollback Strategy
1. Revert changes in `PopularContent.tsx`: `git checkout components/popular/PopularContent.tsx`.
2. Restore `PopularWorksSection.tsx`: `git checkout components/PopularWorksSection.tsx`.

## Implementation Notes
`PopularContent.tsx` is the component actually rendered within `CumulativeSection.tsx` on the main page. `PopularWorksSection.tsx` is a standalone file that is not imported by any other component according to current analysis.
