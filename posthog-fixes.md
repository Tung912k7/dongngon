# PostHog Telemetry Fixes Plan

## Goal
Resolve PostHog telemetry issues (missing pageviews, pageleaves, missing web vitals data) and deploy a reverse proxy (`/ingest`) in Next.js to bypass ad-blockers.

## Tasks
- [x] Task 1: Add PostHog reverse proxy rewrites in `next.config.ts` → Verify: Check if `/ingest/static/` and `/ingest/` destination paths are mapped to PostHog's asset and API hosts.
- [x] Task 2: Update Content-Security-Policy (CSP) `connect-src` in `next.config.ts` → Verify: Confirm `'self'` is allowed and temporary PostHog hosts are kept or cleaned up as needed.
- [x] Task 3: Enable `$pageleave` tracking by setting `capture_pageleave: true` in `app/posthog.tsx` config → Verify: Inspect config initialization inside `posthog.init`.
- [x] Task 4: Fix `$pageview` client-side cleanup leak in `app/posthog.tsx` → Verify: Confirm the timeout is cleared synchronously in the React `useEffect` cleanup return, not nested inside the dynamic import promise.
- [x] Task 5: Configure `api_host` to point to `/ingest` in `app/posthog.tsx` client configurations → Verify: Confirm client-side PostHog queries route through the host's `/ingest` endpoint.
- [x] Task 6: Audit web vitals recording validation → Verify: Ensure `capture_performance: true` is set, and test via browser devtools Network tab to see if performance payloads are dispatched to `/ingest/e/`.

## Done When
- [x] Next.js dev server starts without syntax/config errors.
- [x] Page transitions successfully trigger `$pageview` requests to the local proxy `/ingest/e/` instead of direct PostHog endpoints.
- [x] Client navigation correctly tracks `$pageleave` event when changing views.
- [x] Performance metrics (Web Vitals) payloads are successfully sent and received through the reverse proxy.

## Notes
- The reverse proxy configuration requires configuring rewrites for both `/ingest/static/:path*` (assets/JS library) and `/ingest/:path*` (events ingestion).
- Using a reverse proxy protects client tracking from standard ad-blocker lists (which block `*.posthog.com`). This directly helps collect missing `$web_vitals` and `$pageview` telemetry.
