# Plan 1: Estimated Times + Delay Handling

## Goal
Show real-time/actual times alongside scheduled times in StopTimeline and BookingConfirmation. Flag delays visually. This addresses two spec checkboxes: "scheduled and estimated departure/arrival times" and "clear handling of delays."

## API Reality
The trip API uses `actual` not `estimated`:
- `route[].departure.scheduled` — always present
- `route[].departure.actual` — present only for stops the bus has already visited or is near
- `route[].arrival.scheduled` / `route[].arrival.actual` — same pattern
- Future stops that haven't been reached yet have NO `.actual` key

## Changes Required

### 1. `src/components/StopTimeline.jsx`

**Current behavior:** Shows only `scheduled` time per stop.

**New behavior:**
- Show scheduled time as before
- If `actual` exists and differs from `scheduled` by > 1 minute:
  - Show scheduled time with strikethrough in gray
  - Show actual time in the primary position
  - Add a small colored badge: "X min late" (red/amber) or "X min early" (blue)
- If `actual` exists and matches scheduled (within 1 min): show "On time" in green text, small
- If no `actual` key: show only scheduled (no change)

**Implementation detail in the time column:**
```jsx
// Calculate delay
const scheduled = stop.departure?.scheduled || stop.arrival?.scheduled;
const actual = stop.departure?.actual || stop.arrival?.actual;
const delayMs = actual && scheduled ? new Date(actual) - new Date(scheduled) : 0;
const delayMins = Math.round(delayMs / 60000);

// Render
{actual && Math.abs(delayMins) > 1 ? (
  <>
    <span className="text-xs line-through text-gray-400">{formatTime(scheduled)}</span>
    <span className="font-semibold">{formatTime(actual)}</span>
    <span className={delayMins > 0 ? "text-red-500 text-xs" : "text-blue-500 text-xs"}>
      {delayMins > 0 ? `${delayMins}m late` : `${Math.abs(delayMins)}m early`}
    </span>
  </>
) : (
  <span>{formatTime(scheduled)}</span>
)}
```

The time column width may need to increase from `w-14` to `w-20` to fit the stacked layout.

### 2. `src/pages/TripView.jsx`

**Add a delay summary banner** between the booking-confirmed banner and the map:
- Calculate delay at the passenger's origin stop (find stop where `location.id === originId`)
- If that stop has `.actual` and it's > 2 min late: show amber/red banner "Departure delayed by X minutes"
- If on time or no actual data: don't show anything extra (the green confirmed banner is enough)

### 3. `src/pages/BookingConfirmation.jsx`

**No changes needed.** This screen shows the quote data (pre-booking), which only has scheduled times. Actual/delay data only exists on the trip endpoint, which is only fetched on TripView.

## What NOT to change
- DeparturesList.jsx — quotes endpoint doesn't have actual times
- DepartureCard.jsx — same reason
- TripMap.jsx — no time display on the map
- ember.js API layer — no changes needed, we already fetch the full trip

## Testing
After changes, verify:
1. Trip view with a bus currently running shows actual times on visited stops
2. Future stops still show only scheduled times (no "undefined")
3. Delay badge math is correct (positive = late, negative = early)
4. A trip that hasn't started yet shows no actual times and no delay banner
