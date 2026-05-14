function formatTime(iso) {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

export default function StopTimeline({ stops, originId, destinationId }) {
  // Find the indices of origin and destination in the route
  const originIdx = stops.findIndex((s) => s.location.id === originId);
  const destIdx = stops.findIndex((s) => s.location.id === destinationId);

  return (
    <div className="space-y-0">
      {stops.map((stop, i) => {
        const isOrigin = stop.location.id === originId;
        const isDest = stop.location.id === destinationId;
        const isOnRoute = i >= originIdx && i <= destIdx && originIdx !== -1;
        const isSkipped = stop.skipped;
        const isFirst = i === 0;
        const isLast = i === stops.length - 1;

        // Use departure time for most stops, arrival time for the last
        const time = isLast
          ? formatTime(stop.arrival?.scheduled)
          : formatTime(stop.departure?.scheduled);

        return (
          <div
            key={stop.location.id ?? i}
            className={`flex items-stretch gap-3 ${isSkipped ? "opacity-40" : ""}`}
          >
            {/* Time column */}
            <div className="w-14 text-right shrink-0 py-3">
              <span className={`text-sm font-mono ${isOnRoute ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {time}
              </span>
            </div>

            {/* Timeline column */}
            <div className="flex flex-col items-center w-5 shrink-0">
              {!isFirst && (
                <div className={`w-0.5 flex-1 ${isOnRoute || isDest ? "bg-ember-green" : "bg-gray-200"}`} />
              )}
              <div
                className={`w-3 h-3 rounded-full shrink-0 border-2 ${
                  isOrigin
                    ? "bg-ember-green border-ember-green"
                    : isDest
                    ? "bg-red-500 border-red-500"
                    : isOnRoute
                    ? "bg-white border-ember-green"
                    : "bg-white border-gray-300"
                }`}
              />
              {!isLast && (
                <div className={`w-0.5 flex-1 ${isOnRoute && !isDest ? "bg-ember-green" : "bg-gray-200"}`} />
              )}
            </div>

            {/* Stop info */}
            <div className="flex-1 py-2.5 min-w-0">
              <p
                className={`text-sm leading-tight ${
                  isOnRoute ? "text-gray-900 font-medium" : "text-gray-400"
                } ${isSkipped ? "line-through" : ""}`}
              >
                {stop.location.detailed_name || stop.location.name}
              </p>
              <p className="text-xs text-gray-400">{stop.location.region_name}</p>
              {isOrigin && (
                <span className="inline-block mt-1 text-xs font-semibold text-ember-green bg-green-50 px-2 py-0.5 rounded">
                  Board here
                </span>
              )}
              {isDest && (
                <span className="inline-block mt-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  Alight here
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
