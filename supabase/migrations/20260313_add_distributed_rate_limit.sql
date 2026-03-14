-- Distributed rate limiting primitives for multi-instance deployments.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key text PRIMARY KEY,
  count integer NOT NULL CHECK (count >= 0),
  window_start timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM anon;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM authenticated;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS TABLE (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts timestamptz := timezone('utc'::text, now());
  bucket record;
  retry_secs integer := 0;
BEGIN
  IF p_key IS NULL OR length(p_key) < 3 OR length(p_key) > 120 THEN
    RAISE EXCEPTION 'Invalid rate-limit key';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 10000 THEN
    RAISE EXCEPTION 'Invalid rate-limit limit';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate-limit window';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_key));

  SELECT key, count, window_start
  INTO bucket
  FROM public.rate_limit_buckets
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND OR (bucket.window_start + make_interval(secs => p_window_seconds)) <= now_ts THEN
    INSERT INTO public.rate_limit_buckets (key, count, window_start, updated_at)
    VALUES (p_key, 1, now_ts, now_ts)
    ON CONFLICT (key)
    DO UPDATE SET
      count = 1,
      window_start = EXCLUDED.window_start,
      updated_at = EXCLUDED.updated_at;

    RETURN QUERY SELECT true, p_limit - 1, p_window_seconds;
    RETURN;
  END IF;

  IF bucket.count >= p_limit THEN
    retry_secs := GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM ((bucket.window_start + make_interval(secs => p_window_seconds)) - now_ts)))::integer
    );

    RETURN QUERY SELECT false, 0, retry_secs;
    RETURN;
  END IF;

  UPDATE public.rate_limit_buckets
  SET
    count = count + 1,
    updated_at = now_ts
  WHERE key = p_key
  RETURNING count INTO bucket.count;

  retry_secs := GREATEST(
    1,
    CEIL(EXTRACT(EPOCH FROM ((bucket.window_start + make_interval(secs => p_window_seconds)) - now_ts)))::integer
  );

  RETURN QUERY SELECT true, GREATEST(0, p_limit - bucket.count), retry_secs;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO anon, authenticated;
