# Implementation Plan: Short Guided Onboarding

## 📌 User Request (VERBATIM)
> perfect, create a new plan1.md file and write plan for a short guided onboarding. Also use the approach you just said to me.

## 🎯 Acceptance Criteria (Derived from User Request)
| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | A new plan file `plan1.md` exists | File is present at repository root with full onboarding plan |
| AC2 | Plan is for short guided onboarding | Plan limits guidance to 2-3 concise steps, not a long full tour |
| AC3 | Plan uses the agreed approach | Plan explicitly includes contextual triggers, skip controls, and first-time-only behavior |
| AC4 | Plan explains what it is, how it works, purpose, and how it solves the problem | Each phase includes clear purpose + mechanism + expected impact |
| AC5 | Plan includes success percentages | Each phase and overall outcome include confidence/success ranges |

## 📋 Context Summary
**Architecture**: Next.js App Router + Supabase + Server Actions + PostHog. Existing welcome modal is available and can be extended. Core loop is create -> contribute -> vote.

**Data contract (profiles table)**:
- `has_seen_tour` (bool): onboarding tour visibility state.
- `activated_at` (timestamptz): first meaningful activation timestamp.

**Patterns**: Low-risk incremental rollout, analytics-first changes, no forced long tour, skippable UX.

**Constraints**:
- Keep onboarding lightweight and non-intrusive.
- Show guidance only when context is relevant.
- Preserve existing flows and avoid high-risk scheduler dependencies.

## Overview
Implement a short, contextual guided onboarding that helps first-time users reach their first meaningful action quickly. Instead of a long product tour, use targeted prompts at key moments (welcome, first contribution path, next-step cue) with clear skip controls and measurable outcomes.

## Prerequisites
- [ ] PostHog events are flowing and queryable
  - Verification: New onboarding events appear in PostHog live events.
- [ ] First-time user detection is available
  - Verification: Eligibility rule below is implementable from `profiles.has_seen_tour` and `profiles.activated_at`.
- [ ] Key action entry points are stable
  - Verification: Paths for create, contribute, and vote are valid in current UI.

## Eligibility Contract (Source of Truth)
- **Step 1 (welcome chooser) eligible**: `has_seen_tour = false`
- **Step 2 (contribution hint) eligible**: `has_seen_tour = true AND activated_at IS NULL`
- **Step 3 (post-first-contribution cue) eligible**: fires only on the contribution success that sets `activated_at`
- **Returning users**: `activated_at IS NOT NULL` -> no onboarding hints shown

This removes ambiguity and prevents repeated prompts for activated users.

## Dismissal Persistence Contract
- **Canonical persistence**: database-backed state for cross-device behavior.
- **Schema additions (profiles)**:
  - `onboarding_contrib_hint_dismissed_at TIMESTAMPTZ NULL`
  - `onboarding_next_step_seen_at TIMESTAMPTZ NULL`
- **Read path**: `components/ClientGlobalWrappers.tsx` and `components/Editor.tsx`.
- **Write path**: `actions/profile.ts` (server action updates), with client calls from `components/Editor.tsx`.
- **Fallback (optional)**: localStorage mirror for instant UX, but DB remains source of truth.

## Phase 1: Onboarding Experience Contract
### What it is
Define exactly what the short onboarding includes before implementation.

### How it works
Create one onboarding contract with: step count, trigger conditions, event names, skip logic, and completion logic.

### Purpose
Prevent scope creep and ensure consistent implementation across frontend and analytics.

### How it helps solve retention
A precise contract avoids fragmented UX and enables trustworthy activation metrics.

### Tasks
- [ ] Task 1.1: Define 3-step max onboarding map
  - Agent: `frontend-engineer`
  - File(s): `components/ClientGlobalWrappers.tsx`, `components/WelcomeNotification.tsx`, `components/Editor.tsx`
  - Acceptance: Steps are concise and contextual; no mandatory long tour.
  - Verification: Trigger table approved.
- [ ] Task 1.2: Define analytics event contract
  - Agent: `backend-engineer`
  - File(s): `utils/posthog-server.ts`, `actions/contribute.ts`, `actions/work.ts`, `actions/vote.ts`, `components/WelcomeNotification.tsx`
  - Acceptance: Each step has `shown`, `clicked`, `skipped`, `completed` events and common metadata.
  - Verification: Event checklist complete.

### Exit Criteria
- [ ] Approved step map (max 3 steps).
- [ ] Approved event schema with properties.

### Success Percentage
**95%** (very low risk)

## Phase 2: Contextual UI Guidance (Short + Skippable)
### What it is
Implement lightweight guidance at high-intent moments.

### How it works
Use 3 targeted moments:
1. Welcome action chooser (Explore vs First contribution).
2. Contextual hint at contribution entry point.
3. Post-first-contribution next-step cue.

All guidance must be skippable, dismissible, and shown only to eligible users.

### Purpose
Increase first meaningful action completion in first session.

### How it helps solve retention
Users are nudged exactly when they are ready to act, reducing abandonment from decision friction.

### Tasks
- [ ] Task 2.1: Improve welcome guidance copy + CTA hierarchy
  - Agent: `frontend-engineer`
  - File(s): `components/WelcomeNotification.tsx`, `components/ClientGlobalWrappers.tsx`
  - Acceptance: Primary CTA drives contribution path; secondary CTA allows exploration; clear skip control.
  - Verification: Desktop/mobile manual UX pass + event fire check in PostHog for both CTAs.
- [ ] Task 2.2: Add contribution-entry contextual hint
  - Agent: `frontend-engineer`
  - File(s): `components/Editor.tsx`, `actions/profile.ts`, `components/ClientGlobalWrappers.tsx`
  - Acceptance: Hint appears only for first-time eligible users; dismissal persists cross-device via `profiles.onboarding_contrib_hint_dismissed_at`.
  - Verification: Trigger and dismissal tests pass; hint does not reappear after dismissal/activation/new session.
- [ ] Task 2.3: Add first-success next-step cue
  - Agent: `frontend-engineer`
  - File(s): `components/Editor.tsx`, `actions/contribute.ts`
  - Acceptance: One concise cue suggests next action (vote/return to library) without blocking flow.
  - Verification: Appears once after first contribution success.
- [ ] Task 2.4: Persist onboarding state safely
  - Agent: `backend-engineer`
  - File(s): `actions/profile.ts`, `components/ClientGlobalWrappers.tsx`, `actions/contribute.ts`, `supabase/migrations/`
  - Acceptance: Dismissed/completed steps do not reappear incorrectly.
  - Verification: Repeat-session regression checks pass.

- [ ] Task 2.5: Add onboarding dismissal schema migration
  - Agent: `backend-engineer`
  - File(s): `supabase/migrations/` (new migration for dismissal timestamps)
  - Acceptance: New nullable columns exist and are readable/writable under current RLS model.
  - Verification: SQL migration applied successfully and manual read/write smoke test passes.

### Exit Criteria
- [ ] Guidance is contextual, skippable, and first-time aware.
- [ ] No full-screen forced tour sequence.
- [ ] Onboarding state is persisted correctly.

### Success Percentage
**88%** (low risk)

## Phase 3: Measurement + Iteration Loop
### What it is
Measure onboarding impact and iterate copy/flow using real behavior data.

### How it works
Build dashboards/funnels for:
- Welcome CTA click-through.
- First contribution within 24h.
- D1 and D7 retention.
- Loop progression create -> contribute -> vote.

Run one low-risk copy iteration based on observed drop-off.

### Purpose
Convert onboarding into a measurable growth mechanism.

### How it helps solve retention
Data-driven iteration improves activation and return behavior over time instead of relying on assumptions.

### Tasks
- [x] Task 3.1: Create onboarding funnel + retention dashboards
  - Agent: `tech-lead`
  - File(s): `reports/reviews/`, PostHog dashboard configuration (workspace/external)
  - Execution owner: `backend-engineer`
  - QA owner: `reviewer`
  - Acceptance: Funnel and cohort views are live and filtered by onboarding events.
  - Verification: Dashboards show expected event volumes.
  - Evidence: `reports/reviews/REVIEW-onboarding-phase3-measurement.md`
- [x] Task 3.2: Define weekly optimization cadence
  - Agent: `tech-lead`
  - File(s): `reports/reviews/`, `reports/plans/`
  - Acceptance: Weekly thresholds and decision rules documented.
  - Verification: One weekly review loop executed.
  - Evidence: `reports/plans/PLAN-onboarding-weekly-optimization-cadence.md`
- [x] Task 3.3: Ship one copy/ordering experiment
  - Agent: `frontend-engineer`
  - File(s): `components/WelcomeNotification.tsx`, `components/Editor.tsx`
  - Acceptance: One variant tested with measurable result.
  - Verification: Before/after report generated.
  - Evidence: `components/WelcomeNotification.tsx`, `components/Editor.tsx`, `reports/reviews/REVIEW-onboarding-phase3-measurement.md`

### Exit Criteria
- [x] Activation and retention impact measured.
- [x] At least one iteration completed from data findings.

### Success Percentage
**82%** (low-medium uncertainty due to user behavior variance)

## Phase 4: Reactivation Nudge (Next)
### What it is
Send a low-frequency in-app reminder to users who became idle after creating a work.

### Current status
- [x] Phase 4 implementation plan prepared: `reports/plans/PLAN-onboarding-phase4-reactivation-nudge.md`
- [x] Phase 4 readiness review prepared: `reports/reviews/REVIEW-phase4-reactivation-readiness.md`
- [ ] DB migration + scheduler execution pending

## Risks
| Risk | Impact | Mitigation | Rollback |
|------|--------|------------|----------|
| Onboarding feels intrusive | M | Keep max 3 short steps, all skippable | Disable individual triggers via config/flag |
| Event quality mismatch | H | Use consistent event metadata and versioning | Revert schema additions; remap dashboards |
| Repeated hints annoy users | M | Persist dismissal and cap frequency | Turn off specific hint while keeping rest |
| Mobile layout overlap | M | Validate at mobile breakpoints before rollout | Temporarily hide problematic hint on mobile |

## Rollback Strategy
1. Disable contextual hints first (fastest risk reduction) using **runtime flags** in `public.app_config` (Supabase):
  - `onboarding_welcome_enabled=false`
  - `onboarding_contrib_hint_enabled=false`
  - `onboarding_next_step_enabled=false`
  Runtime flags are read in `components/ClientGlobalWrappers.tsx` so no redeploy is required.
2. Emergency fallback: environment toggles can still be used if runtime config path fails, but this requires redeploy.
3. Keep event capture active for learning continuity.
4. Revert CTA copy/order if conversion drops.
5. Re-enable only the best-performing onboarding step.
6. Re-baseline metrics for one week before next change.

## Implementation Notes
- This is intentionally **not** a long product tour.
- Keep each prompt to one sentence + one primary action.
- Prioritize first meaningful action completion over feature education breadth.
- Success is measured by activation and return behavior, not just onboarding completion.

## KPI Targets + Success Ranges
### Metric Definitions (Required for Reporting Consistency)
- **Cohort inclusion**: authenticated users whose first session starts during the reporting window.
- **Baseline window**: trailing 28 days before onboarding rollout.
- **Activation metric**: user fires first successful contribution event within 24h of cohort start.
- **D1 retention**: user returns and triggers any tracked app event on day 1 after cohort start.
- **D7 retention**: user returns and triggers any tracked app event on day 7 after cohort start.

| Metric | Target (30 days) |
|--------|------------------|
| First contribution within 24h (activation) | +10% to +20% |
| D1 retention | +6% to +12% |
| D7 retention | +4% to +9% |
| Median time to first contribution | -20% to -35% |

**Overall plan success probability**: **84% to 89%** if implemented in phase order with weekly iteration discipline.
