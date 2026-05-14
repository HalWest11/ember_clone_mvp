import { useNavigate } from "react-router-dom";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function duration(dep, arr) {
  const ms = new Date(arr) - new Date(dep);
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function seatColor(count) {
  if (count > 20) return "bg-green-500";
  if (count > 5) return "bg-amber-500";
  return "bg-red-500";
}

export default function DepartureCard({ quote }) {
  const navigate = useNavigate();
  const leg = quote.legs[0];
  const dep = leg.departure.scheduled;
  const arr = leg.arrival.scheduled;
  const seats = quote.availability.seat;
  const pricePence = quote.prices.concession;
  const price = (pricePence / 100).toFixed(2);
  const route = leg.description.destination_board;

  return (
    <button
      onClick={() => navigate(`/booking/${leg.trip_uid}`, { state: { quote } })}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-ember-dark text-white px-2 py-0.5 rounded">
              {route}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {formatTime(dep)}
            </span>
            <span className="text-gray-400 mx-1">&rarr;</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatTime(arr)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{duration(dep, arr)}</span>
            <span className="flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${seatColor(seats)}`} />
              {seats} seats
            </span>
            {leg.description.amenities.has_wifi && <span title="WiFi">WiFi</span>}
          </div>
        </div>
        <div className="text-right pl-4">
          <div className="text-lg font-bold text-ember-green">
            {pricePence === 0 ? "Free" : `£${price}`}
          </div>
          <div className="text-xs text-gray-400">concession</div>
        </div>
      </div>
    </button>
  );
}
