# Ember Clone MVP

A mobile web app covering the core Ember passenger journey: searching departures, booking a concession ticket, and viewing the trip with live bus tracking, delay information, and an interactive map. Built with React 19, Vite 8, Tailwind CSS 4, and React-Leaflet against Ember's real production API.

Time spent: approximately half a day.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # run test suite
npm run build     # production build
```

No native toolchain required. Runs in any modern browser; designed for mobile viewports (430px).

## What I built

Three-screen journey flow:

1. **Departures list** -- route selector (Dundee, Edinburgh, Aberdeen), 7-day date picker, live quote results with seat availability and pricing.
2. **Booking confirmation** -- trip summary with concession fare, stop details, and amenities. Confirm button completes the demo booking.
3. **Trip view** -- interactive Leaflet map with route polyline, stop markers, and live bus position (GPS marker with heading). Full stop timeline showing scheduled vs actual times, delay/early badges, and a stale-data banner when refresh fails. Auto-refreshes every 30 seconds, pauses when the tab is hidden.

Additional details:
- Delay handling: colour-coded banners for significant delays (3+ minutes amber, 10+ minutes red), per-stop delay and early badges, strikethrough on changed times.
- Offline detection: network errors show an offline message; on the trip view, failed refreshes preserve the last known data with a stale indicator rather than clearing the screen.
- GPS freshness indicator: "Live" when position is under 2 minutes old, degrades to "may be outdated" after 5 minutes.
- Seat availability colour coding: green (20+), amber (5-20), red (under 5).
- Content Security Policy restricting requests to self, Ember API, and OpenStreetMap tiles.

## What I deliberately left out

- **Real payment processing** -- the confirm button is a UI demo, not an API call. Concession tickets avoid the need for card handling, but a real integration would POST to a booking endpoint.
- **Full journey search** -- route selection is limited to three cities via dropdown rather than a free-text search with autocomplete. Enough to demonstrate the flow without building a locations API integration.
- **User accounts and authentication** -- no login, no saved bookings, no ticket history.
- **Persistent state** -- trip data passes between screens via React Router state. Refreshing the booking page loses context. A production app would persist to local storage or a backend.
- **Native build** -- chose web over React Native/Expo to prioritise working functionality over build configuration and platform tooling within the time limit.
- **Multi-leg and return trips** -- only single one-way journeys.
- **Seat selection, luggage add-ons, trip modifications, cancellations** -- post-booking management is out of scope.

## How I used AI

Used Claude Code (CLI) to scaffold the project structure, generate initial components, and write tests. Used Cursor for iterative development and debugging. Crawled the live Ember booking flow using Claude in Chrome to ground the UI in the real product experience -- this informed decisions like showing amenities, seat counts, and the stop-by-stop timeline.

All scope and trade-off decisions were mine. I reviewed and tested every piece of generated code against the real API, caught and fixed issues where AI output didn't match the actual API response shape (e.g. price being in pence, route data nesting), and made deliberate choices about what to cut vs. keep.

## API and product assumptions

- Production endpoints (`api.ember.to/v1`) are unauthenticated and publicly accessible.
- `trip_uid` from the quotes response maps directly to the trips endpoint.
- Prices are returned in pence; divided by 100 for display.
- All times are ISO 8601, displayed in `Europe/London` timezone.
- Concession fare (`concession` price from the API) represents a Scottish Bus Pass holder -- zero-cost booking without payment handling.
- A 10-second request timeout covers slow connections without being aggressive.

## What I'd test with more time

Current test coverage (15 tests) focuses on the API layer, price formatting, and stop timeline logic -- the areas most likely to break from API changes or timezone edge cases. With more time I would add:

- **Integration tests** for each page with mocked API responses, verifying loading/error/empty states render correctly.
- **Route selector logic** -- ensuring origin and destination can't match, swap works, and quote refetch triggers on change.
- **Delay calculation edge cases** -- DST transitions, missing actual times, negative delays.
- **Map rendering** -- marker positions match stop coordinates, bus marker appears only when GPS data exists.
- **Navigation flow** -- booking state passes correctly between screens, back button behaviour.

## What I'd improve with more time

- Free-text journey search with location autocomplete from a locations endpoint.
- Proper booking API integration rather than a UI-only confirmation.
- Local storage persistence so refreshing doesn't lose booking context.
- Push-style delay notifications rather than relying on the user checking the trip view.
- Responsive layout beyond 430px for tablet and desktop.
- Accessibility audit (screen reader labels, keyboard navigation, focus management).
- A proper native build via Expo or React Native for app store distribution.
