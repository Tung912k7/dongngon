-- Onboarding dismissal persistence + runtime feature flags

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_contrib_hint_dismissed_at TIMESTAMPTZ NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_next_step_seen_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.profiles.onboarding_contrib_hint_dismissed_at IS
  'Timestamp when user dismissed the contribution hint onboarding step.';

COMMENT ON COLUMN public.profiles.onboarding_next_step_seen_at IS
  'Timestamp when user has seen the post-first-contribution next-step cue.';

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.app_config FROM PUBLIC;
REVOKE ALL ON TABLE public.app_config FROM anon;
REVOKE ALL ON TABLE public.app_config FROM authenticated;

GRANT SELECT ON TABLE public.app_config TO anon, authenticated;

DROP POLICY IF EXISTS "App config is readable" ON public.app_config;
CREATE POLICY "App config is readable"
ON public.app_config FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.app_config (key, value)
VALUES
  ('onboarding_welcome_enabled', '{"enabled": true}'::jsonb),
  ('onboarding_tour_enabled', '{"enabled": false}'::jsonb),
  ('onboarding_contrib_hint_enabled', '{"enabled": true}'::jsonb),
  ('onboarding_next_step_enabled', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = timezone('utc'::text, now());
