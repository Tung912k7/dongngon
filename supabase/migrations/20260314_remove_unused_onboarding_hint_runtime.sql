-- Remove obsolete onboarding hint runtime artifacts after switching to wiki-only guidance.

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS onboarding_contrib_hint_dismissed_at,
  DROP COLUMN IF EXISTS onboarding_next_step_seen_at;

DELETE FROM public.app_config
WHERE key IN ('onboarding_contrib_hint_enabled', 'onboarding_next_step_enabled');
