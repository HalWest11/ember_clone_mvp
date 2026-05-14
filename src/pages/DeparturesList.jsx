import { useState, useEffect } from "react";
import { fetchQuotes } from "../api/ember";
import DepartureCard from "../components/DepartureCard";

function todayFormatted() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  });
}

export default function DeparturesList() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotes()
      .then((q) => setQuotes(q.filter((q) => q.bookable)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="bg-ember-dark text-white px-5 pt-12 pb-5">
        <h1 className="text-2xl font-bold">Dundee &rarr; Edinburgh</h1>
        <p className="text-sm text-gray-300 mt-1">{todayFormatted()}</p>
        <p className="text-xs text-gray-400 mt-0.5">Concession fares shown</p>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-ember-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            Failed to load departures. {error}
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <p className="text-center text-gray-400 py-20">
            No departures found for today.
          </p>
        )}

        {quotes.map((quote) => (
          <DepartureCard key={quote.legs[0].trip_uid} quote={quote} />
        ))}
      </main>
    </div>
  );
}
