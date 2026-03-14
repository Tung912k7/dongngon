-- Cleanup: remove obsolete onboarding tour runtime flag after spotlight tour removal
-- Safe no-op if key does not exist.

DELETE FROM public.app_config
WHERE key = 'onboarding_tour_enabled';
