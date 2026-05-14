# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test framework is configured. No linter is configured.

## Architecture

Three-screen mobile web app (max-width 430px) that books Ember bus tickets using real production APIs. React 19 + Vite 8 + Tailwind CSS 4 + React-Leaflet.

**Routing** (React Router v7, BrowserRouter):
- `/` — DeparturesList: fetches quotes, shows bookable departures
- `/booking/:tripUid` — BookingConfirmation: displays selected trip, concession fare, confirm button
- `/trip/:tripUid` — TripView: fetches trip details, renders Leaflet map + stop timeline

**Data flow:** Quote data passes between screens via React Router `state` (useLocation/useNavigate). No global state management — just useState/useEffect in pages.

**API layer** (`src/api/ember.js`): Two functions wrapping native fetch against `https://api.ember.to/v1`:
- `fetchQuotes(origin, destination, date)` — GET `/quotes/` (defaults: origin=13 Dundee, destination=42 Edinburgh, date=today)
- `fetchTrip(tripUid)` — GET `/trips/{tripUid}/` (only works for future trips)

Prices from the API are in **pence** (divide by 100 for GBP). All times are ISO 8601, displayed in `Europe/London` timezone.

**Component split:** Pages own data fetching and loading/error states. Components (`DepartureCard`, `TripMap`, `StopTimeline`) are presentational, receiving data as props.

## Tailwind Theme

Custom colors defined in `src/index.css` via `@theme`:
- `ember-green` (#2ab34a) — primary/CTA
- `ember-dark` (#1a1a2e) — headers
- `ember-gray` (#f5f5f7) — backgrounds

Uses Tailwind v4 with `@tailwindcss/vite` plugin (no postcss.config needed).

## Deliberate Scope Limits

This is a half-day take-home test MVP. Intentionally excluded: live bus tracking, search inputs, real payments, user auth, offline handling, delay states, backend, database.
