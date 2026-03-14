-- Phase 4: Reactivation nudge automation primitives
-- Safe migration: attempts to adapt to current notifications schema.

-- 1) Query-support indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_created_at
  ON public.notifications (user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contributions_user_created_at
  ON public.contributions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_works_owner_status_created_at
  ON public.works (created_by, status, created_at DESC);

-- 2) Ensure notifications.type allows reactivation_nudge (if a check constraint exists)
DO $$
DECLARE
  type_check_name text;
BEGIN
  SELECT con.conname
  INTO type_check_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'notifications'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%type%';

  IF type_check_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.notifications DROP CONSTRAINT %I', type_check_name);
  END IF;

  ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('contribution', 'announcement', 'system', 'reactivation_nudge'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;

-- 3) Function: enqueue nudges for idle users
-- Rules:
-- - Work owner has active/writing work older than 48h
-- - Owner has no contribution in last 48h
-- - Owner has not received reactivation_nudge in last 7 days
-- - Insert one notification per user per run (target latest eligible work)
CREATE OR REPLACE FUNCTION public.enqueue_reactivation_nudges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  has_content_col boolean := false;
  has_message_col boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'content'
  ) INTO has_content_col;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'message'
  ) INTO has_message_col;

  IF has_content_col THEN
    WITH eligible_works AS (
      SELECT
        w.created_by AS user_id,
        w.id AS work_id,
        row_number() OVER (PARTITION BY w.created_by ORDER BY w.created_at DESC) AS rn
      FROM public.works w
      WHERE w.created_by IS NOT NULL
        AND w.status IN ('writing', 'active')
        AND w.created_at < timezone('utc'::text, now()) - interval '48 hours'
        AND NOT EXISTS (
          SELECT 1
          FROM public.contributions c
          WHERE c.user_id = w.created_by
            AND c.created_at >= timezone('utc'::text, now()) - interval '48 hours'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.notifications n
          WHERE n.user_id = w.created_by
            AND n.type = 'reactivation_nudge'
            AND n.created_at >= timezone('utc'::text, now()) - interval '7 days'
        )
    ), targets AS (
      SELECT user_id, work_id
      FROM eligible_works
      WHERE rn = 1
    )
    INSERT INTO public.notifications (user_id, work_id, type, content, is_read)
    SELECT
      t.user_id,
      t.work_id,
      'reactivation_nudge',
      'Tác phẩm của bạn đang chờ đóng góp.',
      false
    FROM targets t;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
  END IF;

  IF has_message_col THEN
    WITH eligible_works AS (
      SELECT
        w.created_by AS user_id,
        w.id AS work_id,
        row_number() OVER (PARTITION BY w.created_by ORDER BY w.created_at DESC) AS rn
      FROM public.works w
      WHERE w.created_by IS NOT NULL
        AND w.status IN ('writing', 'active')
        AND w.created_at < timezone('utc'::text, now()) - interval '48 hours'
        AND NOT EXISTS (
          SELECT 1
          FROM public.contributions c
          WHERE c.user_id = w.created_by
            AND c.created_at >= timezone('utc'::text, now()) - interval '48 hours'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.notifications n
          WHERE n.user_id = w.created_by
            AND n.type = 'reactivation_nudge'
            AND n.created_at >= timezone('utc'::text, now()) - interval '7 days'
        )
    ), targets AS (
      SELECT user_id, work_id
      FROM eligible_works
      WHERE rn = 1
    )
    INSERT INTO public.notifications (user_id, work_id, type, message, is_read)
    SELECT
      t.user_id,
      t.work_id,
      'reactivation_nudge',
      'Tác phẩm của bạn đang chờ đóng góp.',
      false
    FROM targets t;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
  END IF;

  RAISE EXCEPTION 'notifications table must include content or message column';
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_reactivation_nudges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_reactivation_nudges() TO service_role;

-- Optional manual run:
-- SELECT public.enqueue_reactivation_nudges();
-- Optional schedule (if pg_cron is available and configured):
-- SELECT cron.schedule('reactivation_nudge_daily', '15 2 * * *', $$SELECT public.enqueue_reactivation_nudges();$$);
