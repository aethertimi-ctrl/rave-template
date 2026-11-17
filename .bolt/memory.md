# Project memory

## Product intent & audience

- Single-event marketing/landing site for **iRave 2.0**, a rave-night event.
- Primary audience: Lagos/Ibadan nightlife crowd; site must feel like a real, production-ready event page.
- Core goals: build hype, present lineup/schedule, sell ticket tiers, and capture guest-list RSVPs.
- Add-to-calendar feature intentionally excluded per user request.

## Brand personality & voice

- Bold nightlife/rave energy; Lagos/Ibadan after-dark vibe.
- High-impact, confident, celebratory tone centered on “the night itself.”
- Large iRave wordmark as brand anchor.

## Visual design & UX direction

- Dark “Lagos-night” visual system: black base with paper contrast.
- Signature palette: acid green + rust red accents on black.
- Supplied poster used as visual anchor / inspiration source (not stored as a local asset); paired with a real crowd image.
- Sections: animated event ticker, responsive mobile navigation, stage schedule tabs, ticket selection/tiers, event info, location details, FAQ accordion, guest-list signup.
- Layout is responsive, mobile-first, with bold typographic hierarchy and large wordmark moments.
- Prefers polished, non-cookie-cutter production UI over generic templates.

## Decisions, constraints & rationale

- Stack: vite-react + Tailwind CSS + lucide-react icons; no extra UI theme/icon packages.
- Path alias `@/` → `src/` used for project module imports.
- RSVP/guest-list uses Supabase backend:
  - Public visitors can submit RSVPs only.
  - Attendee submissions are private; public cannot browse, edit, or delete rows.
  - Table grants tightened beyond default platform access to enforce insert-only public behavior, even where RLS already blocked reads.
- Add-to-calendar omitted by explicit user requirement.
- Event date set to **December 12**; year alignment corrected during final QA.
- Build passes compile/type checks after copy updates and access tightening.

## Open questions & assumptions

- Exact event year assumed/current-aligned; confirm if a specific year should be locked.
- Supabase project/credentials wiring is assumed in place; env/config specifics not yet documented.
- Poster asset is referenced conceptually but not stored locally; if poster image should be a real asset, path needs to be added.
- Lineup, schedule, ticket tier names/prices, and location details were inferred from poster context; verify against authoritative event data.
- RSVP captures only what the form includes; backend schema fields beyond insert-only behavior not fully specified.