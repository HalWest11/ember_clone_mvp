# Plan 3: Offline & Stale Data Handling

## Goal
Handle network failures gracefully: show a banner when offline, keep last-known data visible, and indicate when displayed data may be stale. Addresses the spec's "what happens if data is missing, stale, or the phone is offline."

## Approach
Lightweight — no service workers, no localStorage cache. Just:
1. Detect when a fetch fails due to network (vs API error)
2. Show a dismissible offline banner
3. On TripView (which polls), distinguish between "first load failed" and "refresh failed" — the latter keeps existing data visible with a staleness warning

## Changes Required

### 1. `src/pages/TripView.jsx` — Resilient polling

Currently, error state replaces the entire UI. Change to:

**Track two states separately:**
- `trip` — last successfully loaded trip data (persists across failed refreshes)
- `loadError` — error from the initial load (shows full-screen error)
- `stale` — boolean, true when a refresh poll fails but we have prior data

```jsx
const [trip, setTrip] = useState(null);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState(null);
const [stale, setStale] = useState(false);

useEffect(() => {
  let active = true;
  let firstLoad = true;

  const load = () => {
    fetchTrip(tripUid)
      .then((data) => {
        if (!active) return;
        setTrip(data);
        setStale(false);
        if (firstLoad) setLoading(false);
        firstLoad = false;
      })
      .catch((e) => {
        if (!active) return;
        if (firstLoad) {
          setLoadError(e.message);
          setLoading(false);
          firstLoad = false;
        } else {
          // Refresh failed — mark stale but keep existing data
          setStale(true);
        }
      });
  };

  load();
  const interval = setInterval(load, 30000);
  return () => { active = false; clearInterval(interval); };
}, [tripUid]);
```

**Show stale banner** above the map when `stale` is true:
```jsx
{stale && (
  <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-amber-400" />
    <span className="text-xs text-amber-700">
      Unable to refresh — showing last known data
    </span>
  </div>
)}
```

### 2. `src/pages/DeparturesList.jsx` — Offline-aware error

Distinguish network error from API error in the error display:

```jsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
    <p className="text-red-700 font-medium">
      {error.includes("fetch") || error.includes("network") || error.includes("Failed to fetch")
        ? "You appear to be offline"
        : "Failed to load departures"}
    </p>
    <p className="text-red-500 mt-1 text-xs">{error}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-3 text-ember-green font-semibold text-sm"
    >
      Try again
    </button>
  </div>
)}
```

Add a retry button — simple `window.location.reload()` is fine for MVP.

### 3. `src/pages/BookingConfirmation.jsx` — Guard missing state

This screen already handles missing `quote` state. No changes needed — the existing guard is sufficient.

## What NOT to change
- ember.js — fetch already throws on network errors with a descriptive message
- TripMap.jsx — no changes
- StopTimeline.jsx — no changes  
- DepartureCard.jsx — no changes

## Edge Cases Handled
- Phone goes offline after DeparturesList loaded: user can still tap a card and see BookingConfirmation (data is in router state). TripView first load will fail with offline message.
- Phone goes offline during TripView polling: stale banner appears, last data stays visible, polling continues trying. When network returns, banner disappears automatically.
- API returns 500: treated same as network error for retry purposes.

## Testing
1. Load departures, disable network, refresh — "You appear to be offline" with retry button
2. Load TripView, disable network, wait 30s — stale banner appears, map/timeline still show last data
3. Re-enable network — stale banner disappears on next poll
4. Navigate to BookingConfirmation with no router state — "No booking data" fallback (already works)
