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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrip(tripUid)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripUid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-ember-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">
          Failed to load trip details. {error}
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

      {/* Map */}
      <div className="h-64 w-full">
        <TripMap stops={stops} originId={originId} destinationId={destinationId} />
      </div>

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
