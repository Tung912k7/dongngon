-- Post-run note (2026-03-14):
-- Cleanup SQL for the removed interactive onboarding spotlight tour was executed successfully.
-- This file is intentionally kept as verification-only to avoid re-running data mutations.
--
-- Applied cleanup summary:
-- 1) Introduced/backfilled public.profiles.has_acknowledged_welcome_message.
-- 2) Removed legacy public.profiles.has_seen_tour.
-- 3) Removed obsolete app_config key: onboarding_tour_enabled.
-- 4) Help-center cleanup SQL was intentionally removed from this file (already executed).
-- 5) Switched to wiki-only guidance; onboarding hint runtime artifacts are now obsolete.

-- Verify onboarding-related profile columns.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'has_acknowledged_welcome_message',
    'has_seen_tour',
    'activated_at'
  )
ORDER BY column_name;

-- Verify that obsolete onboarding hint columns are removed.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'onboarding_contrib_hint_dismissed_at',
    'onboarding_next_step_seen_at'
  )
ORDER BY column_name;

-- Verify remaining onboarding config keys.
SELECT key, value, updated_at
FROM public.app_config
WHERE key LIKE 'onboarding_%'
ORDER BY key;

-- Verify obsolete onboarding hint config keys are removed.
SELECT key, value, updated_at
FROM public.app_config
WHERE key IN ('onboarding_contrib_hint_enabled', 'onboarding_next_step_enabled')
ORDER BY key;
