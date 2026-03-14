-- Maintenance helpers for distributed rate limiting.
-- Safe to run after 20260313_add_distributed_rate_limit.sql.

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated_at
ON public.rate_limit_buckets (updated_at);

CREATE OR REPLACE FUNCTION public.purge_old_rate_limit_buckets(
  p_older_than_seconds integer DEFAULT 86400,
  p_delete_limit integer DEFAULT 5000
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_rows integer := 0;
BEGIN
  IF p_older_than_seconds < 60 OR p_older_than_seconds > 604800 THEN
    RAISE EXCEPTION 'Invalid purge threshold';
  END IF;

  IF p_delete_limit < 1 OR p_delete_limit > 20000 THEN
    RAISE EXCEPTION 'Invalid delete limit';
  END IF;

  WITH to_delete AS (
    SELECT key
    FROM public.rate_limit_buckets
    WHERE updated_at < (timezone('utc'::text, now()) - make_interval(secs => p_older_than_seconds))
    ORDER BY updated_at ASC
    LIMIT p_delete_limit
  )
  DELETE FROM public.rate_limit_buckets b
  USING to_delete d
  WHERE b.key = d.key;

  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  RETURN deleted_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_rate_limit_buckets(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_rate_limit_buckets(integer, integer) TO service_role;
