# Stitch Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the platform according to the "Chữ Việt Zen" (Modern Ink) design system, resolving all user requirements and feedback.

**Architecture:** Integrate the "Modern Ink" colors, typography (Gánh font for headings/displays, Be Vietnam Pro for body/labels), rounded properties, and spacing system into Tailwind CSS v4 in `globals.css`. Redesign the navigation layout, Trang Chủ sections, Rankings page, visual Ink Trail timeline on Profile, and Về Chúng Tôi page. Redesign `components/Feed.tsx` and `app/work/[id]/page.tsx` to serve as the chrome-less "Phòng Viết" canvas. Integrate dynamic copy counter in contributions database for Ink Point calculations.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, Zustand, Supabase client/realtime, Vitest.

---

## Technical Context & Decisions

Based on the direct feedback received from the user:

1. **Phòng Viết / Writing Room:** It is the existing `components/Feed.tsx` text flow rendered in the `app/work/[id]` details page. We will style this to look like a beautiful, chrome-less writing canvas with a maximum reading width of 720px, large line heights, and premium typography.
2. **Zen Mode Font:** Use _Be Vietnam Pro_ with italic styling.
3. **"Viết Ngay" (Write Now) Action:** Fetches a random active work (`status = 'writing'`, `privacy = 'Public'`) excluding those created by hidden users, and redirects to its page.
4. **Collaborator Cursors:** Removed from design scope per user request.
5. **Ink Points Calculation:** Calculated dynamically using the formula: `(contributions_count * 10) + (total_copies_of_contributions * 5)`. Requires adding a `copy_count` column to the `contributions` table.
6. **Homepage layout:** Consists of Hero, Inspiration Flow, Open Projects, Contribution Showcase (redesigned), and Core Values. The `RankingsPreview` is removed.

---

### Task 1: Database Migration for Copy Tracking

**Files:**

- Create: `supabase/migrations/20260528205200_add_copy_count_to_contributions.sql`
- Modify: `types/database.ts:15-24`

**Step 1: Write the SQL migration**
Create `supabase/migrations/20260528205200_add_copy_count_to_contributions.sql`:

```sql
ALTER TABLE contributions ADD COLUMN copy_count INTEGER DEFAULT 0 NOT NULL;
```

**Step 2: Update TypeScript definitions**
Modify `types/database.ts` to include `copy_count?: number` under the `Contribution` type.

**Step 3: Commit**

```bash
git add supabase/migrations/20260528205200_add_copy_count_to_contributions.sql types/database.ts
git commit -m "db: add copy_count column to contributions table for Ink Points calculation"
```

---

### Task 2: Style & Theme Foundation

**Files:**

- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Test: `app/globals.css` (Visual/Build verification)

**Step 1: Write the failing test**
Verify Next.js build compiles the new Tailwind `@theme` directives without error.

**Step 2: Run test to verify it fails**
Run: `npm run build` or inspect styles before updating.

**Step 3: Write minimal implementation**
Modify `app/globals.css` to add the color variables, and configure Zen Mode styling to use _Be Vietnam Pro_ with italic style:

```css
@theme {
  --color-background: #f9f9ff;
  --color-foreground: #141b2b;
  --color-surface: #f9f9ff;
  --color-surface-dim: #d3daef;
  --color-surface-bright: #f9f9ff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f1f3ff;
  --color-surface-container: #e9edff;
  --color-surface-container-high: #e1e8fd;
  --color-surface-container-highest: #dce2f7;
  --color-on-surface: #141b2b;
  --color-on-surface-variant: #404847;
  --color-outline: #707977;
  --color-outline-variant: #bfc8c6;
  --color-primary: #003633;
  --color-on-primary: #ffffff;
  --color-primary-container: #134e4a;
  --color-on-primary-container: #87beb8;
  --color-secondary: #735c00;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #fed65b;
  --color-on-secondary-container: #745c00;
  --color-tertiary: #003630;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #004f46;
  --color-on-tertiary-container: #12c9b4;
  --color-accent-gold: #d4af37;
  --color-deep-teal: #134e4a;
  --color-mist-grey: #e5e7eb;
  --color-ink-charcoal: #111827;
  --color-paper-bg: #f9fafb;

  --font-ganh-type: var(--font-ganh-next), serif;
  --font-be-vietnam-pro: var(--font-be-vietnam-next), sans-serif;
  --font-sans: var(--font-be-vietnam-pro);
  --font-serif: var(--font-ganh-type);
}

.zen-mode-active .content-display {
  font-family: var(--font-be-vietnam-pro), sans-serif !important;
  font-style: italic !important;
  font-size: 1.25rem;
  line-height: 2;
  color: #111827;
  transition: all 0.8s ease-in-out;
}
```

**Step 4: Run test to verify it passes**
Run: `npm run build`
Expected: Build passes with new Tailwind configuration.

**Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: configure Modern Ink design system tokens and Zen Mode typography"
```

---

### Task 3: Minimalist Navigation Header & Random "Viết Ngay" Redirection

**Files:**

- Create: `actions/randomWork.ts`
- Modify: `components/Header.tsx`
- Create: `components/__tests__/Header.test.tsx`

**Step 1: Write server action for random work**
Create `actions/randomWork.ts` that selects a random writing project, avoiding hidden users.

**Step 2: Update Header.tsx and write test**
Modify `components/Header.tsx`:

- Render "Viết Ngay" button executing `getRandomActiveWork` client side, then calling `router.push(`/work/${workId}`)`.
- Remove search bar from the header.
- Add test in `components/__tests__/Header.test.tsx` verifying elements.

**Step 3: Run test to verify it passes**
Run: `npm run test:unit components/__tests__/Header.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add actions/randomWork.ts components/Header.tsx components/__tests__/Header.test.tsx
git commit -m "feat: implement random work fetcher and integrate into redesigned header"
```

---

### Task 4: Homepage Redesign (Inspiration Flow, Open Projects, and Showcase)

**Files:**

- Create: `components/InspirationFlow.tsx`
- Create: `components/OpenProjects.tsx`
- Create: `components/CoreValues.tsx`
- Modify: `components/ContributionShowcase.tsx`
- Modify: `app/page.tsx`
- Create: `components/__tests__/HomepageComponents.test.tsx`

**Step 1: Redesign ContributionShowcase**
Modify `components/ContributionShowcase.tsx` to align with the new Modern Ink palette and remove borders, styling text in Be Vietnam Pro.

**Step 2: Create new page components**

1. **InspirationFlow.tsx:** Horizontally scrolling mood board of excerpts using Gánh titles.
2. **OpenProjects.tsx:** Displays list of active works.
3. **CoreValues.tsx:** Zen writing core values.

**Step 3: Update page.tsx and run tests**
Modify `app/page.tsx` to render: `HeroSectionV2`, `InspirationFlow`, `OpenProjects`, `ContributionShowcase`, and `CoreValues` (RankingsPreview is removed).
Run: `npm run test:unit components/__tests__/HomepageComponents.test.tsx`

**Step 4: Commit**

```bash
git add app/page.tsx components/InspirationFlow.tsx components/OpenProjects.tsx components/CoreValues.tsx components/ContributionShowcase.tsx
git commit -m "feat: update homepage sections to align with new design and showcase guidelines"
```

---

### Task 5: Copy Tracking Event & Tooltip Styles

**Files:**

- Create: `actions/copyTracking.ts`
- Modify: `components/ContributionTooltip.tsx`

**Step 1: Create copy action**
Create `actions/copyTracking.ts` to increment `copy_count`.

**Step 2: Update copy button logic and style**
Modify `components/ContributionTooltip.tsx` so that `handleCopy()` calls `incrementCopyCount(contribution.id)` in the background. Redesign the tooltip container layout to match Modern Ink rounded profiles, colors, and shadows.

**Step 3: Commit**

```bash
git add actions/copyTracking.ts components/ContributionTooltip.tsx
git commit -m "feat: track contribution copy actions for dynamic Ink Points calculation"
```

---

### Task 6: Phòng Viết Redesign (Story Feed and Canvas layout)

**Files:**

- Modify: `components/Feed.tsx`
- Modify: `app/work/[id]/page.tsx`
- Modify: `components/WorkPageLayout.tsx`
- Test: `components/__tests__/Feed.test.tsx`

**Step 1: Redesign Feed canvas**
Modify `components/Feed.tsx` to format paragraph and text flows as a clean, book-like text block using Be Vietnam Pro for prose and Gánh headers. Capped at `720px` width. Implement floating select triggers or elegant popup behaviors.

**Step 2: Clean layout page**
Modify `app/work/[id]/page.tsx` and `components/WorkPageLayout.tsx` to remove thick borders and implement tonal layers (`#F9FAFB`) with ambient shadows.

**Step 3: Commit**

```bash
git add components/Feed.tsx app/work/[id]/page.tsx components/WorkPageLayout.tsx
git commit -m "feat: redesign Feed and Work Details page into a clean writing canvas (Phòng Viết)"
```

---

### Task 7: Bảng Vàng Rankings Page (Dynamic Ink Points)

**Files:**

- Modify: `app/rankings/page.tsx`
- Create: `components/__tests__/Rankings.test.tsx`

**Step 1: Write Rankings logic**
Modify `app/rankings/page.tsx` to query and calculate the dynamic Ink Points:

- Select all active writers.
- Sum up `contributions_count` and `copy_count` per user: `(contributions_count * 10) + (total_copy_count * 5)`.
- Order by total Ink Points descending and display Bảng Vàng.

**Step 2: Run test**
Run: `npm run test:unit components/__tests__/Rankings.test.tsx`

**Step 3: Commit**

```bash
git add app/rankings/page.tsx
git commit -m "feat: complete Rankings board with dynamic Ink Points calculation"
```

---

### Task 8: Profile & Ink Trail Timeline & About Page

**Files:**

- Create: `components/InkTrail.tsx`
- Modify: `app/profile/page.tsx`
- Create: `app/ve-chung-toi/page.tsx`
- Modify: `components/DongNgonClient.tsx`
- Modify: `components/WorkLibraryItem.tsx`

**Step 1: Profile timeline**
Create `components/InkTrail.tsx` and integrate it into `app/profile/page.tsx`.

**Step 2: About page & Library refresh**
Create `app/ve-chung-toi/page.tsx` and refresh `components/DongNgonClient.tsx` / `components/WorkLibraryItem.tsx` cards styles.

**Step 3: Commit**

```bash
git add components/InkTrail.tsx app/profile/page.tsx app/ve-chung-toi/page.tsx components/DongNgonClient.tsx components/WorkLibraryItem.tsx
git commit -m "feat: integrate Ink Trail profile timeline, build About Us page, and refresh Library cards"
```
