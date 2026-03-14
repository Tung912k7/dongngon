# Retention Improvement Plan — Đồng Ngôn

> **Created**: March 13, 2026
> **Scope**: User retention analysis + actionable implementation roadmap
> **Touch policy**: No code is touched until this plan is approved. This document describes *what*, *why*, and *how confident we are* — not the actual implementation.

---

## Context: What Is the Problem?

"Đồng Ngôn" is a collaborative Vietnamese literary platform.  
The **core product loop** is: **Create → Contribute → Vote → Notify → Return**.

Right now, that loop has **no instrumentation** and **no intentional nudge system**.

- PostHog is wired to track only pageviews (`$pageview`). Zero custom events exist.
- The onboarding screen (`WelcomeNotification`) just says "welcome" — it does not guide users toward the first meaningful action.
- There is no mechanism to bring back a user who hasn't returned in 48–72 hours.
- There is no definition of what an "activated" user even is.

The result: **we cannot know** if users are retained, which step they drop off at, or whether any product change actually improves things.

The plan below fixes this in **four concrete initiatives**, ordered by impact-to-effort ratio.

---

## Initiative 1 — Retention Event Taxonomy

### What it is
A set of named custom events sent to PostHog each time a user completes a key action. Think of it as a vocabulary for measuring behavior.

### How it works
Each time a server action succeeds (creating a work, submitting a contribution, casting a vote), a small PostHog `capture()` call fires. Because our server actions run on the Next.js server, we use the PostHog Node SDK (`posthog-node`) to send these events from the server side, tied to the authenticated user's ID.

The events we would add:

| Event Name | Where it fires | What it measures |
|---|---|---|
| `work_created` | `actions/work.ts` → `createWork` | A user started a collaborative work |
| `contribution_submitted` | `actions/contribute.ts` → `submitContribution` | A user added a line/stanza to someone's work |
| `vote_submitted` | `actions/vote.ts` → `voteEndWork` | A user voted to conclude a work |
| `work_completed` | `actions/vote.ts` when vote threshold reached | A full loop was completed |
| `first_contribution` | `actions/contribute.ts`, first-time only | User crossed the activation threshold |

### Purpose
Build a funnel dashboard in PostHog that answers: "Out of 100 users who registered this week, how many created a work? How many contributed? How many returned on day 7?"

### How it solves the problem
Currently we are flying blind. No data = no direction. Event taxonomy is the foundation that all other initiatives depend on. Without it, we cannot measure whether Initiative 2, 3, or 4 actually improved anything.

### Success chance
**95%** — This is pure instrumentation. The PostHog SDK is already installed and initialized. It requires adding approximately 5–8 lines of code per action file. No UI changes. No schema changes. No risk of breaking anything. The only failure scenario is a misconfigured `POSTHOG_API_KEY` env var on the server.

---

## Initiative 2 — Activation Milestone Definition + Tracking

### What it is
An explicit definition of "activated user": **a user who submits their first contribution within 24 hours of registration**. Combined with a `user_activated` event and a profile flag stored in the database so we can track the cohort longitudinally.

### How it works
1. In `actions/contribute.ts`, after a successful `INSERT` into the `contributions` table, we check the user's `profiles` row to see if `activated_at` is null.
2. If null, we set `profiles.activated_at = NOW()` and fire a `user_activated` PostHog event with the property `hours_since_signup`.
3. In PostHog, we build a **D1 activation rate chart**: "% of users who register and fire `user_activated` within 24h."

This requires one new nullable column: `profiles.activated_at TIMESTAMPTZ DEFAULT NULL`.

### Purpose
Turn an abstract question ("are users retained?") into a concrete, testable metric. The activation rate is the single most predictive metric for long-term retention in content platforms.

### How it solves the problem
Right now we cannot distinguish between a user who registered and immediately left, versus one who engaged. By tagging first contribution, we get a clear percentage (current baseline is unknown — likely 10–25% for a cold-start platform) and a target to optimize against.

### Success chance
**85%** — The logic is straightforward. The small risk is the database migration (adding a column to `profiles`). Supabase column additions are backward-compatible and non-destructive, so schema risk is very low. The 15% uncertainty is around whether PostHog's person identification correctly links server-side events to the same person as browser pageviews (depends on whether `user.id` is consistently passed as `distinct_id`).

---

## Initiative 3 — Guided First Action (Improved WelcomeNotification)

### What it is
A redesign of the current `WelcomeNotification` modal. Instead of a generic "start exploring" button, the modal offers **two specific directed actions** with short explanatory copy:

- **"Khám phá tác phẩm"** → navigates to `/kho-tang` (the works library)
- **"Viết dòng đầu tiên"** → opens a work card and scrolls directly to the contribution input

The current modal close action just sets `onboarding_completed = true` in the profile and refreshes the page. The new version sets a `welcome_cta_clicked` property (which CTA was chosen) so we can measure which path converts better.

### How it works
- The `WelcomeNotification` component already has a dismiss handler (`handleDismiss`) that calls `completeOnboarding()`.
- We replace the single "Bắt đầu khám phá" button with two buttons.
- Each button fires a `welcome_cta_clicked` PostHog event (client-side, via `posthog.capture()`) with a `{ cta: 'explore' | 'contribute' }` property, then navigates to the appropriate route.
- No backend changes needed. The modal is already client-side only.

### Purpose
Reduce the gap between "user sees welcome modal" and "user takes first meaningful action." The current modal is a dead end — it closes and returns the user to the homepage, which is a static hero section. There is no obvious next step. We are leaving users without direction at the highest-intent moment of their entire lifecycle.

### How it solves the problem
Studies on collaborative platforms consistently show that users who take a meaningful action within the first session return at 3–4× the rate of those who don't. The modal is the last guardrail before a user exits without acting. Giving them a specific destination with clear value copy is the lowest-effort, highest-leverage change in this plan.

### Success chance
**90%** — This is a frontend-only change to a single component. No API changes. No schema changes. The only risk is a UX judgment call: whether users respond better to the "contribute" CTA or the "explore" CTA. That is measurable via the `welcome_cta_clicked` event, so even if the first version underperforms, we have data to iterate.

---

## Initiative 4 — Reactivation Nudge for Idle Users

### What it is
An automated in-app notification sent to users who have created a work but have not returned for 48 hours. The message reads: "Tác phẩm của bạn đang chờ đóng góp." ("Your work is waiting for contributions.") and links directly to their work.

### How it works
This is the most architecturally complex initiative. It requires:

1. **A scheduled job** that runs once per day and queries:
   ```sql
   SELECT w.created_by, w.id, w.title
   FROM works w
   JOIN profiles p ON p.id = w.created_by
   WHERE w.status = 'active'
     AND w.created_at < NOW() - INTERVAL '48 hours'
     AND (
       SELECT MAX(c.created_at)
       FROM contributions c
       WHERE c.user_id = w.created_by
     ) < NOW() - INTERVAL '48 hours'
     AND NOT EXISTS (
       SELECT 1 FROM notifications n
       WHERE n.user_id = w.created_by
         AND n.type = 'reactivation_nudge'
         AND n.created_at > NOW() - INTERVAL '7 days'
     );
   ```
   This finds active work owners who haven't contributed in 48h and haven't received a nudge in 7 days.

2. **Insert a row into the `notifications` table** for each matched user, using the existing notification system (`app/notification/`, `actions/notification.ts`).

3. The user sees the nudge the next time they open the site, via the existing notification bell in the header.

The scheduled job can be implemented as either:
- A **Supabase pg_cron job** (runs inside PostgreSQL, no extra infrastructure)
- A **Next.js Route Handler** called by an external cron service (e.g., Vercel Cron)

### Purpose
The most common reason users don't return is not that they dislike the product — it's that they simply forgot. A single contextual nudge tied to their own content ("your work") is significantly more effective than generic "come back" messages because it references something the user already invested time in creating.

### How it solves the problem
Without any reactivation mechanism, users who leave after day 1 are simply lost. This initiative creates a re-entry path at the 48h mark — the critical window before the user's memory of the platform fades completely. The nudge is low-frequency (max once per 7 days per user) and opt-out by nature of the existing notification system, so it does not feel spammy.

### Success chance
**70%** — This is the riskiest initiative because it introduces a new automated write path to the `notifications` table and requires a scheduled job. Risks:
- The cron schedule has to be set up correctly in the deployment environment.
- The query must be index-optimized to avoid scanning full tables (requires checking existing indexes on `contributions.created_at` and `notifications.type`).
- We do not know the current notification table schema in detail, so an audit pass is needed before implementation.

The 70% reflects implementation confidence, not product value. The product hypothesis itself is very well-validated across the industry.

---

## Summary Table

| # | Initiative | Complexity | Risk | Success Chance | Impact |
|---|---|---|---|---|---|
| 1 | Event Taxonomy | Low | Very Low | **95%** | Foundation for all decisions |
| 2 | Activation Milestone | Low-Medium | Low | **85%** | Defines the D1 target metric |
| 3 | Guided Welcome CTA | Low | Very Low | **90%** | Highest leverage per line of code |
| 4 | Reactivation Nudge | Medium-High | Medium | **70%** | Brings back dormant users |

---

## Recommended Order of Execution

```
Week 1: Initiative 1 (Event Taxonomy) + Initiative 3 (Welcome CTA)
         → Both are low-risk, fast to implement, and deliver data immediately

Week 2: Initiative 2 (Activation Milestone)
         → Builds on Initiative 1's tracking foundation
         → Requires one DB migration (low risk, but needs a deploy window)

Week 3: Initiative 4 (Reactivation Nudge)
         → Highest implementation risk; do last when we have baseline data
         → Needs notification table audit before touching
```

---

## Measurement Plan

After all four initiatives are live, we set these **30-day targets**:

| Metric | Current Baseline | Target |
|---|---|---|
| D1 Activation Rate (first contribution ≤ 24h) | Unknown (tracking starts at Week 1) | +15% vs baseline |
| D7 Retention Rate (user returns on day 7) | Unknown | +8% vs baseline |
| Core loop completion (work created → contributed → voted) | Unknown | +10% |
| Median time from registration to first contribution | Unknown | -30% (faster activation) |

All four metrics become measurable only after Initiative 1 is live, which is why it is the mandatory first step.

---

## What This Plan Does NOT Include

- Changes to the rate limiting system (already implemented, working)
- Security changes (all completed in the previous workstream)
- Any database restructuring beyond the single `activated_at` column
- Email notifications (out of scope — would require a transactional email provider integration)
- A/B testing infrastructure (PostHog supports A/B testing natively; can be added as a follow-up once event taxonomy is live and we have traffic data to split)
