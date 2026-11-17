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

Run the SQL files in `supabase/migrations/` in order (SQL editor or `supabase db push`).

For the public site, the browser no longer writes directly to `irave_rsvps`. Instead, the app calls a Supabase Edge Function named `submit-rsvp`, which performs server-side validation and inserts via the service role key. Public clients are blocked from direct INSERT by the migration files.

## Deploy (GitHub Pages)

1. Repo **Settings > Pages > Source: GitHub Actions**.
2. Repo **Settings > Secrets and variables > Actions**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy the Supabase Edge Function (`supabase/functions/submit-rsvp`) to your Supabase project, and add `SUPABASE_SERVICE_ROLE_KEY` in the project secrets.
4. Push to `main` (or run the *Deploy to GitHub Pages* workflow).

## Customising

Event copy, lineup, prices and links live in `src/App.tsx`; the doors-open date is in `src/Countdown.tsx`.
