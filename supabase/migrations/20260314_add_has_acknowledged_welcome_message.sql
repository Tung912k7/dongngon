-- Introduce a semantically correct welcome acknowledgement flag.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_acknowledged_welcome_message BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'has_seen_tour'
  ) THEN
    EXECUTE $sql$
      UPDATE public.profiles
      SET has_acknowledged_welcome_message = COALESCE(has_seen_tour, FALSE)
      WHERE has_acknowledged_welcome_message IS DISTINCT FROM COALESCE(has_seen_tour, FALSE)
    $sql$;

    EXECUTE 'ALTER TABLE public.profiles DROP COLUMN IF EXISTS has_seen_tour';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.has_acknowledged_welcome_message IS
  'Whether the user has acknowledged the welcome message modal.';