import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchTrip } from "../api/ember";
import TripMap from "../components/TripMap";
import StopTimeline from "../components/StopTimeline";

export default function TripView() {
  const { tripUid } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const originId = state?.originId;
  const destinationId = state?.destinationId;

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
    let interval = setInterval(load, 30000);

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
        interval = null;
      } else {
        load();
        interval = setInterval(load, 30000);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [tripUid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-ember-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">
          {loadError.includes("abort")
            ? "Request timed out. Please try again."
            : loadError.includes("fetch") || loadError.includes("Failed to fetch")
              ? "You appear to be offline."
              : "Failed to load trip details."}
        </div>
        <button onClick={() => navigate("/")} className="text-ember-green font-semibold">
          Back to departures
        </button>
      </div>
    );
  }

  const stops = trip.route || [];
  const routeNum = trip.description?.route_number;
  const vehicle = trip.vehicle;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="bg-ember-dark text-white px-5 pt-12 pb-4">
        <button onClick={() => navigate("/")} className="text-sm text-gray-300 mb-2 flex items-center gap-1">
          <span>&larr;</span> Back to departures
        </button>
        <div className="flex items-center gap-2">
          {routeNum && (
            <span className="text-xs font-semibold bg-white text-ember-dark px-2 py-0.5 rounded">
              {routeNum}
            </span>
          )}
          <h1 className="text-lg font-bold">Your Trip</h1>
        </div>
      </header>

      {/* Booking confirmed banner */}
      <div className="bg-green-50 border-b border-green-200 px-5 py-3 flex items-center gap-2">
        <span className="text-ember-green text-lg">&#10003;</span>
        <span className="text-sm font-medium text-green-800">Booking confirmed (demo)</span>
      </div>

      {/* Delay banner */}
      {(() => {
        const originStop = stops.find((s) => s.location.id === originId);
        if (!originStop) return null;
        const scheduled = originStop.departure?.scheduled;
        const actual = originStop.departure?.actual;
        if (!actual || !scheduled) return null;
        const delayMins = Math.round((new Date(actual) - new Date(scheduled)) / 60000);
        if (delayMins <= 2) return null;
        return (
          <div className={`${delayMins >= 10 ? "bg-red-50 border-b border-red-200" : "bg-amber-50 border-b border-amber-200"} px-5 py-3 flex items-center gap-2`}>
            <span className="text-lg">{delayMins >= 10 ? "\u26A0" : "\u23F1"}</span>
            <span className={`text-sm font-medium ${delayMins >= 10 ? "text-red-800" : "text-amber-800"}`}>
              Departure delayed by {delayMins} minute{delayMins !== 1 ? "s" : ""}
            </span>
          </div>
        );
      })()}

      {/* Stale data banner */}
      {stale && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-amber-700">
            Unable to refresh — showing last known data
          </span>
        </div>
      )}

      {/* Map */}
      <div className="h-64 w-full">
        <TripMap stops={stops} originId={originId} destinationId={destinationId} vehicleGps={trip.vehicle?.gps} />
      </div>

      {/* GPS freshness indicator */}
      {trip.vehicle?.gps?.last_updated && (() => {
        const minutesAgo = Math.floor((Date.now() - new Date(trip.vehicle.gps.last_updated).getTime()) / 60000);
        if (minutesAgo > 5) {
          return (
            <div className="px-5 py-1.5 flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Position may be outdated
            </div>
          );
        }
        if (minutesAgo >= 2) {
          return (
            <div className="px-5 py-1.5 flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Updated {minutesAgo} min ago
            </div>
          );
        }
        return (
          <div className="px-5 py-1.5 flex items-center gap-1.5 text-xs text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Live
          </div>
        );
      })()}

      {/* Vehicle info */}
      {vehicle && (
        <div className="flex gap-3 px-5 py-3 border-b border-gray-100 text-xs text-gray-500">
          {vehicle.seat != null && <span>{vehicle.seat} seats</span>}
          {vehicle.has_wifi && <span>WiFi</span>}
          {vehicle.has_toilet && <span>Toilet</span>}
          {vehicle.bicycle != null && <span>{vehicle.bicycle} bike spaces</span>}
        </div>
      )}

      {/* Stop timeline */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 px-1">All stops</h2>
        <StopTimeline stops={stops} originId={originId} destinationId={destinationId} />
      </main>
    </div>
  );
}
