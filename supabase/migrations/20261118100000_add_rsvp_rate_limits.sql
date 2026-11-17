-- Database-backed RSVP throttling. Keys are SHA-256 hashes; raw IP addresses are never stored.
CREATE TABLE IF NOT EXISTS public.irave_rsvp_rate_limits (
  rate_key text PRIMARY KEY CHECK (char_length(rate_key) = 64),
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0)
);

ALTER TABLE public.irave_rsvp_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.irave_rsvp_rate_limits FROM anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.irave_rsvp_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_irave_rsvp_rate_limit(
  p_rate_key text,
  p_limit integer DEFAULT 5,
  p_window_seconds integer DEFAULT 3600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_rate_key !~ '^[0-9a-f]{64}$'
     OR p_limit < 1 OR p_limit > 100
     OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate-limit parameters';
  END IF;

  INSERT INTO public.irave_rsvp_rate_limits (rate_key, window_started_at, request_count)
  VALUES (p_rate_key, now(), 1)
  ON CONFLICT (rate_key) DO UPDATE
    SET request_count = CASE
          WHEN public.irave_rsvp_rate_limits.window_started_at
               <= now() - make_interval(secs => p_window_seconds)
          THEN 1
          ELSE public.irave_rsvp_rate_limits.request_count + 1
        END,
        window_started_at = CASE
          WHEN public.irave_rsvp_rate_limits.window_started_at
               <= now() - make_interval(secs => p_window_seconds)
          THEN now()
          ELSE public.irave_rsvp_rate_limits.window_started_at
        END
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_irave_rsvp_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_irave_rsvp_rate_limit(text, integer, integer) TO service_role;

-- Keep the table bounded without requiring pg_cron. Expired keys are removed during requests.
CREATE OR REPLACE FUNCTION public.prune_irave_rsvp_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.irave_rsvp_rate_limits
  WHERE window_started_at < now() - interval '2 days';
$$;

REVOKE ALL ON FUNCTION public.prune_irave_rsvp_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_irave_rsvp_rate_limits() TO service_role;
