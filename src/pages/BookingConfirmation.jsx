import { useParams, useLocation, useNavigate } from "react-router-dom";

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

export default function BookingConfirmation() {
  const { tripUid } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const quote = state?.quote;

  if (!quote) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-6">
        <p className="text-gray-500 mb-4">No booking data found.</p>
        <button onClick={() => navigate("/")} className="text-ember-green font-semibold">
          Back to departures
        </button>
      </div>
    );
  }

  const leg = quote.legs[0];
  const dep = leg.departure.scheduled;
  const arr = leg.arrival.scheduled;
  const pricePence = quote.prices.concession;
  const price = pricePence === 0 ? "Free" : `£${(pricePence / 100).toFixed(2)}`;
  const wifi = leg.description.amenities.has_wifi;
  const toilet = leg.description.amenities.has_toilet;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="bg-ember-dark text-white px-5 pt-12 pb-5">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-300 mb-3 flex items-center gap-1">
          <span>&larr;</span> Back
        </button>
        <h1 className="text-xl font-bold">Confirm Booking</h1>
      </header>

      <main className="flex-1 px-5 py-6 space-y-5">
        {/* Route card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            {/* Timeline dots + line */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-ember-green" />
              <div className="w-0.5 h-16 bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>

            {/* Stop info */}
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-lg font-semibold">{formatTime(dep)}</p>
                <p className="text-sm text-gray-600">{leg.origin.detailed_name}</p>
                <p className="text-xs text-gray-400">{leg.origin.region_name}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{formatTime(arr)}</p>
                <p className="text-sm text-gray-600">{leg.destination.detailed_name}</p>
                <p className="text-xs text-gray-400">{leg.destination.region_name}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="text-sm text-gray-500 pt-8">
              {duration(dep, arr)}
            </div>
          </div>
        </div>

        {/* Ticket details */}
        <div className="bg-ember-gray rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Ticket</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-800">1 &times; Concession</p>
              <p className="text-xs text-gray-500">Scottish Bus Pass</p>
            </div>
            <p className="text-xl font-bold text-ember-green">{price}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex gap-4 text-sm text-gray-500 px-1">
          {wifi && <span>&#x1F4F6; WiFi on board</span>}
          {toilet && <span>&#x1F6BD; Toilet on board</span>}
          <span>&#x1F9F3; Luggage included</span>
        </div>

        {/* Confirm button */}
        <button
          onClick={() =>
            navigate(`/trip/${tripUid}`, {
              state: {
                originId: leg.origin.id,
                destinationId: leg.destination.id,
                quote,
              },
            })
          }
          className="w-full bg-ember-green text-white font-semibold py-4 rounded-xl text-lg active:brightness-90 transition"
        >
          Confirm Booking
        </button>

        <p className="text-xs text-center text-gray-400">
          Demo only &mdash; no real booking is made.
          <br />
          Free travel with a valid Scottish Bus Pass.
        </p>
      </main>
    </div>
  );
}
