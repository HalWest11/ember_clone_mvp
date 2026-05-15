# Plan 2: Live Bus Position + Polling

## Goal
Show the bus's live GPS position on the map and auto-refresh trip data every 30 seconds. This addresses "the live position of the bus" from the spec and makes estimated times/delays stay current.

## API Reality
From `GET /v1/trips/{trip_uid}/`:
```json
"vehicle": {
  "gps": {
    "latitude": 56.4585033,
    "longitude": -2.9671233,
    "heading": 315,
    "last_updated": "2026-05-14T21:22:21.505000+01:00"
  }
}
```
- `vehicle.gps` is present when the bus has a GPS fix
- `heading` is degrees from north (0-360)
- `last_updated` tells us how fresh the data is
- `vehicle.gps` may be `null` if bus hasn't started or GPS is unavailable

## Changes Required

### 1. `src/pages/TripView.jsx` — Add polling

**Add a 30-second polling interval:**
```jsx
useEffect(() => {
  let active = true;

  const load = () => {
    fetchTrip(tripUid)
      .then((data) => { if (active) setTrip(data); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
  };

  load();
  const interval = setInterval(load, 30000);

  return () => { active = false; clearInterval(interval); };
}, [tripUid]);
```

Replace the existing `useEffect` with this. The `active` flag prevents state updates after unmount.

**Pass vehicle GPS to TripMap:**
```jsx
<TripMap
  stops={stops}
  originId={originId}
  destinationId={destinationId}
  vehicleGps={trip.vehicle?.gps}
/>
```

### 2. `src/components/TripMap.jsx` — Add bus marker

**Accept new prop `vehicleGps`.**

**Add a bus marker** when `vehicleGps` exists and has coordinates:
```jsx
// Bus icon — a directional marker
function busIcon(heading) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#2ab34a;border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;color:white;
      transform:rotate(${heading ?? 0}deg)
    ">&#9650;</div>`,
  });
}
```

**Render the bus marker:**
```jsx
{vehicleGps && vehicleGps.latitude && (
  <Marker
    position={[vehicleGps.latitude, vehicleGps.longitude]}
    icon={busIcon(vehicleGps.heading)}
    zIndexOffset={1000}
  />
)}
```

**Add a "last updated" indicator below the map in TripView.jsx:**
Show small gray text: "Bus position updated X min ago" calculated from `vehicleGps.last_updated`. If stale (> 5 min), show in amber: "Bus position may be outdated".

### 3. `src/pages/TripView.jsx` — GPS freshness indicator

Below the map div, add:
```jsx
{trip.vehicle?.gps?.last_updated && (
  <GpsFreshness lastUpdated={trip.vehicle.gps.last_updated} />
)}
```

Implement inline or as a small component. Calculate minutes since `last_updated`:
- < 2 min: green dot + "Live"
- 2-5 min: show "Updated X min ago"  
- > 5 min: amber dot + "Position may be outdated"

This can just be a few lines inside TripView — no need for a separate file.

## What NOT to change
- DeparturesList.jsx — no GPS data on quotes
- BookingConfirmation.jsx — no trip data here
- StopTimeline.jsx — no changes (estimated times are handled in Plan 1)
- ember.js — no changes needed, fetchTrip already returns vehicle.gps

## Edge Cases
- `vehicle.gps` is null: don't render bus marker, don't show freshness indicator
- `vehicle.gps.latitude` is null/0: skip marker
- Bus hasn't started (future trip): GPS may be at the depot or null — this is fine, marker just shows where bus currently is
- Polling fails (network blip): keep showing last known data, don't clear trip state. Only update error state if the FIRST load fails.

## Testing
1. Open a trip for a bus currently running — bus marker appears on map
2. Wait 30s — marker position updates (or stays if bus is stopped)
3. Stale GPS (> 5 min) shows amber warning
4. Trip with no GPS data shows no marker and no freshness indicator
5. Navigate away and back — no leaked intervals (check console)
