/*
  # Harden RSVP submissions

  - One RSVP per email (case-insensitive) to block duplicate spam.
  - Basic email format check (NOT VALID so existing rows are not rescanned).

  If the unique index fails, duplicate emails already exist: remove them in the
  Supabase dashboard and re-run.
*/

CREATE UNIQUE INDEX IF NOT EXISTS irave_rsvps_email_unique
  ON public.irave_rsvps (lower(email));

ALTER TABLE public.irave_rsvps
  DROP CONSTRAINT IF EXISTS irave_rsvps_email_format;

ALTER TABLE public.irave_rsvps
  ADD CONSTRAINT irave_rsvps_email_format
  CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') NOT VALID;
