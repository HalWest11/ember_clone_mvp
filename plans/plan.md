# Ember Clone MVP — Build Plan

## Context

Take-home test for Ember (bus company). Build a functional customer app targeting web, styled as a mobile app. Three screens: departures list, booking confirmation, trip view with map. Real Ember API data. No backend, no payments, no auth. Half-day time budget.

---

## File & Folder Structure

```
ember_clone_mvp/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                  # Tailwind directives + mobile viewport
│   ├── api/
│   │   └── ember.js               # All API calls (quotes, trips)
│   ├── pages/
│   │   ├── DeparturesList.jsx      # Screen 1
│   │   ├── BookingConfirmation.jsx # Screen 2
│   │   └── TripView.jsx           # Screen 3
│   └── components/
│       ├── DepartureCard.jsx       # Single departure row
│       ├── StopTimeline.jsx        # Vertical stop list for trip view
│       └── TripMap.jsx             # React-Leaflet map component
└── README.md                       # Submission notes
```

**13 files total.** No utils folder, no context providers, no state management library.

---

## Dependencies

| Package | Why |
|---------|-----|
| `react`, `react-dom` | UI framework |
| `react-router-dom` | Three-screen navigation |
| `leaflet`, `react-leaflet` | Map on trip view screen |
| `tailwindcss`, `@tailwindcss/vite` | Styling (Tailwind v4 with Vite plugin — no PostCSS config needed) |
| `vite`, `@vitejs/plugin-react` | Build tool |

**That's it.** No axios (use fetch). No date library (use Intl.DateTimeFormat). No state manager (prop drilling across 3 screens is fine).

---

## API Calls

### 1. Quotes — Screen 1 (Departures List)

```
GET https://api.ember.to/v1/quotes/?origin=13&destination=42&departure_date_from=2026-05-14T00:00:00Z&departure_date_to=2026-05-14T23:59:59Z
```

- `origin=13` = Dundee (City Centre), `destination=42` = Edinburgh (City Centre)
- Date is dynamically set to **today** at runtime
- No auth required
- Returns `{ quotes: [...], min_card_transaction: 30 }`

**Fields we use from each quote:**
- `legs[0].trip_uid` — to fetch trip details later
- `legs[0].departure.scheduled` / `legs[0].arrival.scheduled` — display times
- `legs[0].origin.name` / `legs[0].destination.name` — stop names
- `legs[0].origin.lat/lon` / `legs[0].destination.lat/lon` — for map
- `legs[0].description.destination_board` — route number (e.g. "E1")
- `legs[0].description.amenities` — wifi/toilet icons
- `prices.adult` / `prices.concession` — price display (in pence, divide by 100)
- `availability.seat` — seat count
- `bookable` — filter out unbookable quotes

### 2. Trip Details — Screen 3 (Trip View)

```
GET https://api.ember.to/v1/trips/{trip_uid}/
```

- `trip_uid` comes from the selected quote's `legs[0].trip_uid`
- No auth required for future trips
- Returns full route with all intermediate stops

**Fields we use:**
- `route[]` — array of all stops in order
  - `route[].location.name` / `route[].location.detailed_name` — stop name
  - `route[].location.lat` / `route[].location.lon` — map markers
  - `route[].location.region_name` — city name
  - `route[].departure.scheduled` / `route[].arrival.scheduled` — times
  - `route[].allow_boarding` / `route[].allow_drop_off` — stop type
  - `route[].skipped` — grey out skipped stops
- `vehicle.seat` / `vehicle.bicycle` / `vehicle.wheelchair` — capacity
- `vehicle.has_wifi` / `vehicle.has_toilet` — amenities
- `description.route_number` — route label
- `description.is_cancelled` — show cancelled state

---

## Build Order

### Step 1: Project Scaffold
- `npm create vite@latest . -- --template react`
- Install all deps
- Configure Tailwind v4 (just the Vite plugin + `@import "tailwindcss"` in CSS)
- Set up mobile viewport in index.html (`<meta name="viewport" ...>`)
- Set up React Router in App.jsx with three routes:
  - `/` → DeparturesList
  - `/booking/:tripUid` → BookingConfirmation
  - `/trip/:tripUid` → TripView
- Add global mobile-app styling: max-width 430px, centered, min-height 100dvh

### Step 2: API Layer (`src/api/ember.js`)
- `fetchQuotes(origin, destination, date)` — calls quotes endpoint, returns quotes array
- `fetchTrip(tripUid)` — calls trips endpoint, returns trip object
- Both use native `fetch`, return parsed JSON
- Hardcode origin=13, destination=42 as defaults

### Step 3: Screen 1 — Departures List (`DeparturesList.jsx` + `DepartureCard.jsx`)

**Layout:**
- Header: "Dundee to Edinburgh" + today's date
- Scrollable list of DepartureCard components
- Loading spinner while fetching
- Error state if API fails

**DepartureCard shows:**
- Departure time → Arrival time (formatted as HH:MM)
- Duration (calculated from scheduled times)
- Seat availability with green/amber/red dot
- Price (concession price, formatted as £X.XX)
- Route number badge (e.g. "E1")
- Tap → navigate to `/booking/{tripUid}`, passing quote data via route state

**Data flow:**
- `useEffect` on mount → `fetchQuotes(13, 42, today)`
- Filter to only `bookable: true` quotes
- Sort by departure time (already sorted from API)

### Step 4: Screen 2 — Booking Confirmation (`BookingConfirmation.jsx`)

**Layout:**
- Back arrow → returns to departures list
- Route summary card:
  - Origin stop name + departure time
  - Vertical line
  - Destination stop name + arrival time
  - Duration
- Ticket details box:
  - "1x Concession (Scottish Bus Pass)" 
  - Price: £0.00 (concession is free on Ember)
- Amenities row: wifi, toilet icons if available
- Green "Confirm Booking" button
- Tap button → navigate to `/trip/{tripUid}`
- Small disclaimer: "This is a demo. No real booking is made."

**Data flow:**
- Receives quote data via React Router `useLocation().state`
- No API call needed — all data comes from the quote

### Step 5: Screen 3 — Trip View (`TripView.jsx` + `TripMap.jsx` + `StopTimeline.jsx`)

**Layout (two sections, scrollable):**

**Top half — Map (`TripMap.jsx`):**
- React-Leaflet map using OpenStreetMap tiles
- Markers for every stop on the route (from trips endpoint `route[]`)
- Origin marker: green
- Destination marker: red  
- Intermediate stops: small grey circles
- Polyline connecting all stops in order
- Map auto-fits bounds to show all markers
- Highlight the passenger's boarding and alighting stops

**Bottom half — Stop Timeline (`StopTimeline.jsx`):**
- Vertical timeline of ALL stops on the route
- Each stop shows:
  - Scheduled departure or arrival time
  - Stop name + region
  - "Board here" / "Alight here" label for passenger's stops
  - Skipped stops shown greyed out with strikethrough
- Vehicle info footer: route number, wifi, toilet, seat capacity

**Data flow:**
- `useEffect` on mount → `fetchTrip(tripUid)`
- `tripUid` from URL params
- Origin/destination IDs passed via route state to highlight passenger's stops
- Loading and error states

---

## Assumptions

1. **Concession tickets are free** — Ember concession price from API is £0.00 (Scottish Bus Pass holders travel free). This means we skip payment entirely and it's still realistic.
2. **No CORS issues** — The Ember API allows browser requests (confirmed by successful fetch from their website).
3. **Trips endpoint works for future trips without auth** — Confirmed by testing.
4. **One leg per journey** — Dundee→Edinburgh is always direct, so `legs[0]` is safe.
5. **Date defaults to today** — No date picker needed for MVP.
6. **No live bus tracking** — Trips for future departures don't have live position data. The map shows the route and stops statically. This is noted as a deliberate scope cut.

---

## Verification

1. `npm run dev` — app loads at localhost:5173
2. Screen 1: Departures list populates with real Ember data for today
3. Tap a departure → Screen 2 shows booking confirmation with correct times and £0.00 concession price
4. Tap "Confirm Booking" → Screen 3 shows map with all stops and a timeline
5. Map markers match real stop locations on OpenStreetMap
6. Back navigation works on all screens
7. Resize browser to 390px wide — app looks like a mobile app
8. Test with API failure (disconnect network) — error states show gracefully
