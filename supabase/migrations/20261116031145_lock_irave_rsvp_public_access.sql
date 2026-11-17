/*
# Lock public RSVP table access

1. Modified Tables
- `irave_rsvps` keeps its existing RSVP columns and stored submissions unchanged.
- Removes public Data API privileges for SELECT, UPDATE, and DELETE.

2. Security
- Keeps INSERT available to `anon` and `authenticated` for the public guest-list form.
- Ensures attendees cannot browse, edit, or delete RSVP submissions through the public client.
- Existing row-level security and deny policies remain in place.

3. Important Notes
- No rows are removed or changed by this migration.
- The event page only needs to create new RSVP submissions.
*/

REVOKE SELECT, UPDATE, DELETE ON public.irave_rsvps FROM anon, authenticated;
GRANT INSERT ON public.irave_rsvps TO anon, authenticated;
