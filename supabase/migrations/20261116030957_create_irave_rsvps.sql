/*
# Create iRave RSVP submissions

1. New Tables
- `irave_rsvps`
- `id` (uuid, primary key) uniquely identifies an RSVP.
- `name` (text) stores the attendee name shown in the RSVP form.
- `email` (text) stores the attendee contact email for event updates.
- `ticket_type` (text) stores the ticket interest selected in the form.
- `created_at` (timestamptz) records when the RSVP was submitted.

2. Security
- Enables row level security on `irave_rsvps`.
- Grants only INSERT access to `anon` and `authenticated`, because the public site only needs to submit RSVPs.
- Adds separate SELECT, INSERT, UPDATE, and DELETE policies. Public visitors may insert RSVP submissions; reading, changing, or deleting submissions is denied through the Data API.

3. Important Notes
- This is a single-tenant event landing page with no sign-in flow.
- The table intentionally does not expose attendee submissions for public browsing.
- The form remains useful even when a visitor has not created an account.
*/

CREATE TABLE IF NOT EXISTS public.irave_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 160),
  ticket_type text NOT NULL CHECK (ticket_type IN ('Regular pass', 'Group of 4', 'Table of 4')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.irave_rsvps ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.irave_rsvps TO anon, authenticated;

DROP POLICY IF EXISTS "RSVPs cannot be read publicly" ON public.irave_rsvps;
CREATE POLICY "RSVPs cannot be read publicly"
ON public.irave_rsvps FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Anyone can submit an RSVP" ON public.irave_rsvps;
CREATE POLICY "Anyone can submit an RSVP"
ON public.irave_rsvps FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "RSVPs cannot be changed publicly" ON public.irave_rsvps;
CREATE POLICY "RSVPs cannot be changed publicly"
ON public.irave_rsvps FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "RSVPs cannot be deleted publicly" ON public.irave_rsvps;
CREATE POLICY "RSVPs cannot be deleted publicly"
ON public.irave_rsvps FOR DELETE
TO anon, authenticated
USING (false);
