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

1. Run the SQL files in `supabase/migrations/` in timestamp order (SQL editor or `supabase db push`), including the RSVP rate-limit migration.
2. Deploy the Edge Function `submit-rsvp` (see below). The browser has no direct INSERT access, so the function and migrations must both be deployed for RSVPs to save.

The browser never writes to `irave_rsvps` directly. It calls the `submit-rsvp` Edge Function, which validates the
input and inserts using the service role. Public clients are blocked from INSERT, SELECT, UPDATE and DELETE.

### Deploy the Edge Function

- **Dashboard:** Supabase > Edge Functions > Deploy a new function > Via Editor. Name it `submit-rsvp`,
  paste in `supabase/functions/submit-rsvp/index.ts` and deploy.
- **CLI:** `supabase functions deploy submit-rsvp`

Notes:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to Edge Functions automatically. You do not add them as secrets.
- Configure the Edge Function secrets `ALLOWED_ORIGINS` as a comma-separated list of exact site origins (for example, `https://your-account.github.io` and your custom domain). Requests from other browser origins will not receive CORS permission.
- Set `RSVP_RATE_LIMIT_SALT` to a long random secret in the Edge Function secrets. If omitted, the function uses the service-role key as its hashing pepper. Never expose either secret in `VITE_` variables.
- The function limits each proxy-reported client IP to twenty valid RSVP attempts per hour. It stores only a salted SHA-256 hash, not the raw IP. Confirm your hosting/proxy sets `cf-connecting-ip`, `x-real-ip`, or a trusted `x-forwarded-for` header; do not trust client-supplied forwarding headers if your deployment does not overwrite them.
- CORS is a browser boundary, not authentication or bot protection. The Edge Function validates all fields, checks the honeypot, caps request bodies, and applies server-side throttling.
- If the browser gets a 401 from the function and you use the newer "publishable" API key instead of the legacy anon key,
  turn off "Verify JWT" for this function (CLI: `--no-verify-jwt`).

## CI checks and deploy the site (GitHub Pages)

Pull requests to `main` run `npm ci`, ESLint, TypeScript type-checking and a production build. Only pushes to `main` (or a manual run) deploy to Pages.



1. Repo **Settings > Pages > Source: GitHub Actions**.
2. Repo **Settings > Secrets and variables > Actions**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Push to `main` (or run the *Deploy to GitHub Pages* workflow).

## Customising

Ticket names, prices, perks, the doors-open time and the event end time are centralised in `src/config/event.ts`. Event copy, line-up, ticket link and sponsors remain in `src/App.tsx`. Update the event dates there and keep the visible date copy in the page in sync.
Sponsor logos are in `src/assets/sponsors/`.
