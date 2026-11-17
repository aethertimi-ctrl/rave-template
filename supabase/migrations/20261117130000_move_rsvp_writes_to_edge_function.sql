/*
# Move RSVP writes off the public anon client

- Removes public INSERT access from `irave_rsvps`.
- Allows only the Supabase service role to insert RSVP rows.
- Keeps browse/update/delete blocked for public clients.
*/

REVOKE INSERT ON public.irave_rsvps FROM anon, authenticated;
GRANT INSERT ON public.irave_rsvps TO service_role;

DROP POLICY IF EXISTS "Anyone can submit an RSVP" ON public.irave_rsvps;
CREATE POLICY "Service role can submit RSVPs"
ON public.irave_rsvps FOR INSERT
TO service_role
WITH CHECK (true);
