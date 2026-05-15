# Plan 4: Focused Unit Tests

## Goal
Add a small, focused test suite covering the essential functionality from the brief's assessment criteria. The brief says: "We don't expect exhaustive test coverage, but we'd like to see a few focused tests."

## Test Strategy

Three test files targeting the three highest-value areas per the assessment criteria:

| File | What it tests | Brief criterion |
|------|--------------|-----------------|
| `src/__tests__/api.test.js` | API layer — URL construction, error handling, response parsing | "how cleanly you integrate with real APIs" |
| `src/__tests__/StopTimeline.test.jsx` | Delay display — scheduled vs actual, delay badges, on-time, board/alight labels | "how you handle failure modes and edge cases" |
| `src/__tests__/DepartureCard.test.jsx` | Price formatting, seat availability coloring, time display | "whether the product decisions are sensible" |

## Test Framework

**Vitest** — native Vite integration, zero-config with existing vite.config.js, same API as Jest.

### Dependencies to install
```
vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Config
Add `test` block to `vite.config.js`:
```js
test: {
  environment: "jsdom",
  setupFiles: "./src/__tests__/setup.js",
}
```

Add script to `package.json`:
```json
"test": "vitest run"
```

### Setup file (`src/__tests__/setup.js`)
Import `@testing-library/jest-dom` for DOM matchers (toBeInTheDocument, toHaveTextContent, etc.).

## Test Cases

### `api.test.js` (5 tests, no DOM)
Mocks `global.fetch` — no network calls.

1. **fetchQuotes builds correct URL** — calls fetch with origin=13, destination=42, date params spanning the full day
2. **fetchQuotes returns quotes array** — extracts `.quotes` from response JSON
3. **fetchQuotes throws on HTTP error** — 500 response throws with status in message
4. **fetchTrip builds correct URL** — calls fetch with `/trips/{uid}/`
5. **fetchTrip throws on HTTP error** — 404 response throws with status in message

### `StopTimeline.test.jsx` (6 tests, renders component)
No router needed — StopTimeline is purely presentational.

Test data: array of 3 stops (origin, mid, destination) with controlled scheduled/actual times.

1. **Shows scheduled time when no actual** — future stop shows "HH:MM" only
2. **Shows actual time with strikethrough when delayed** — stop with actual 10min late shows strikethrough scheduled, bold actual, "10m late" badge
3. **Shows early badge** — stop with actual 5min early shows "5m early" in blue
4. **Shows "On time" when actual matches scheduled** — actual within 1min shows "On time" in green
5. **Shows "Board here" at origin** — origin stop has green badge
6. **Shows "Alight here" at destination** — destination stop has red badge

### `DepartureCard.test.jsx` (4 tests, renders component)
Wraps in MemoryRouter since DepartureCard uses `useNavigate`.

Test data: a quote object matching the shape from the quotes API.

1. **Formats price from pence** — 1250 pence renders as "£12.50"
2. **Shows "Free" for zero concession** — 0 pence renders "Free"
3. **Green seat indicator for >20 seats** — availability.seat=25 renders green dot
4. **Red seat indicator for <=5 seats** — availability.seat=3 renders red dot

## Run Command
```bash
npm test        # single run
npx vitest      # watch mode
```

## What's NOT tested (and why)
- **TripMap**: Leaflet requires a real DOM with canvas/SVG — jsdom can't render maps. Would need Playwright/Cypress for this.
- **BookingConfirmation**: Thin screen that just displays passed data — no logic worth unit testing. Covered by the DepartureCard price tests (same formatting).
- **TripView**: Heavy integration page (polling, routing, multiple child components). Would test with an e2e framework, not unit tests.
- **Polling behavior**: Would need fake timers and async act() — fragile in unit tests. Better tested with Playwright watching network requests.
- **Offline detection**: The detection logic is a simple string match in JSX — testing it adds test maintenance without catching real bugs. The real offline behavior needs a browser DevTools network toggle.
