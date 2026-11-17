# iRave 2.0 — event landing page template

Vite + React + TypeScript + Tailwind, with a Supabase-backed guest list.

## Run locally

```bash
npm install
cp .env.example .env   # add your Supabase URL + anon key
npm run dev
```

The site renders without the env vars; the guest-list form then shows a friendly message instead of saving.

## Supabase setup

1. Run the SQL files in `supabase/migrations/` in order (SQL editor or `supabase db push`).
2. Deploy the Edge Function `submit-rsvp` (see below). **Do this before or together with the last migration**:
   that migration removes the browser's direct INSERT access, so until the function is live the form cannot save.

The browser never writes to `irave_rsvps` directly. It calls the `submit-rsvp` Edge Function, which validates the
input and inserts using the service role. Public clients are blocked from INSERT, SELECT, UPDATE and DELETE.

### Deploy the Edge Function

- **Dashboard:** Supabase > Edge Functions > Deploy a new function > Via Editor. Name it `submit-rsvp`,
  paste in `supabase/functions/submit-rsvp/index.ts` and deploy.
- **CLI:** `supabase functions deploy submit-rsvp`

Notes:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to Edge Functions automatically. You do not add them as secrets.
- The function sends CORS headers, which the browser needs because the site and Supabase are on different origins.
- If the browser gets a 401 from the function and you use the newer "publishable" API key instead of the legacy anon key,
  turn off "Verify JWT" for this function (CLI: `--no-verify-jwt`).

## Deploy the site (GitHub Pages)

1. Repo **Settings > Pages > Source: GitHub Actions**.
2. Repo **Settings > Secrets and variables > Actions**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Push to `main` (or run the *Deploy to GitHub Pages* workflow).

## Customising

Event copy, line-up, prices, ticket link and sponsors live in `src/App.tsx`; the doors-open date is in `src/Countdown.tsx`.
Sponsor logos are in `src/assets/sponsors/`.
