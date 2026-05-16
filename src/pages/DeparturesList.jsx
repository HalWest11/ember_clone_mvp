import { useState, useEffect, useCallback } from "react";
import { fetchQuotes } from "../api/ember";
import DepartureCard from "../components/DepartureCard";
import RouteSelector, { CITIES } from "../components/RouteSelector";
import DatePicker from "../components/DatePicker";

function isToday(date) {
  const now = new Date();
  const d = new Date(date);
  const opts = { timeZone: "Europe/London" };
  return (
    d.toLocaleDateString("en-GB", opts) ===
    now.toLocaleDateString("en-GB", opts)
  );
}

function cityName(id) {
  return CITIES.find((c) => c.id === id)?.name ?? id;
}

export default function DeparturesList() {
  const [origin, setOrigin] = useState(13);
  const [destination, setDestination] = useState(42);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQuotes = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchQuotes(origin, destination, selectedDate)
      .then((q) => {
        const today = isToday(selectedDate);
        const now = new Date();
        setQuotes(
          q.filter(
            (quote) =>
              quote.bookable &&
              (!today || new Date(quote.legs[0].departure.scheduled) > now)
          )
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [origin, destination, selectedDate]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  function handleRouteChange(newOrigin, newDestination) {
    setOrigin(newOrigin);
    setDestination(newDestination);
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="bg-ember-dark text-white px-5 pt-12 pb-5 space-y-4">
        <RouteSelector
          origin={origin}
          destination={destination}
          onChange={handleRouteChange}
        />
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <div>
          <h1 className="text-xl font-bold">
            {cityName(origin)} &rarr; {cityName(destination)}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Concession fares shown</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-ember-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
            <p className="text-red-700 font-medium">
              {error.includes("abort")
                ? "Request timed out"
                : error.includes("fetch") || error.includes("network") || error.includes("Failed to fetch")
                  ? "You appear to be offline"
                  : "Failed to load departures"}
            </p>
            <button
              onClick={loadQuotes}
              className="mt-3 text-ember-green font-semibold text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <p className="text-center text-gray-400 py-20">
            No departures found for{" "}
            {isToday(selectedDate)
              ? "today"
              : selectedDate.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: "Europe/London",
                })}
            .
          </p>
        )}

        {quotes.map((quote) => (
          <DepartureCard key={quote.legs[0].trip_uid} quote={quote} />
        ))}
      </main>
    </div>
  );
}
