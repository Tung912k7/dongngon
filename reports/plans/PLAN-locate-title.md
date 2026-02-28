## Implementation Plan: Locate and Clarify Popular Works Title

### User Request
where is the title "Các tác phẩm phổ biến"?

### Analysis
The string exists in an unused component `PopularWorksSection.tsx`. The active component `PopularContent.tsx` uses a slightly different string.

### Phase 1: Disclosure
1. Provide the exact location of the string.
2. Explain the discrepancy between `PopularWorksSection` and `PopularContent`.

### Phase 2: Actionable Options
1. Update `PopularContent.tsx` to use the preferred "Các tác phẩm phổ biến" string.
2. Or, if `PopularWorksSection.tsx` was intended to be the new component, help the user integrate it into `CumulativeSection.tsx`.

### Acceptance Criteria
- [ ] User is informed of the location: `components/PopularWorksSection.tsx:80`.
- [ ] User is informed that `PopularContent.tsx` currently displays "Các tác phẩm nổi tiếng".
