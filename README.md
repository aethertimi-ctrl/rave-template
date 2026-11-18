# iRave 2.0 — event landing page

Vite + React + TypeScript + Tailwind. A static one-page site with no backend.
Tickets are sold on Nairaevents and Partyfinder; the site links to both event pages.

## Run locally

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

1. Repo **Settings > Pages > Source: GitHub Actions**.
2. Push to `main` (or run the *Deploy to GitHub Pages* workflow).

## Customising

Event copy, line-up, prices, ticket links, sponsors and the WhatsApp number live in `src/App.tsx`;
the doors-open date is in `src/Countdown.tsx`. Sponsor logos are in `src/assets/sponsors/`.
