const CITIES = [
  { id: 13, name: "Dundee" },
  { id: 42, name: "Edinburgh" },
  { id: 174, name: "Aberdeen" },
];

export { CITIES };

export default function RouteSelector({ origin, destination, onChange }) {
  function handleSwap() {
    onChange(destination, origin);
  }

  function handleOriginChange(e) {
    const newOrigin = Number(e.target.value);
    if (newOrigin === destination) {
      onChange(newOrigin, origin);
    } else {
      onChange(newOrigin, destination);
    }
  }

  function handleDestinationChange(e) {
    const newDest = Number(e.target.value);
    if (newDest === origin) {
      onChange(destination, newDest);
    } else {
      onChange(origin, newDest);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="text-xs text-gray-400 block mb-1">From</label>
        <select
          value={origin}
          onChange={handleOriginChange}
          className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:border-ember-green"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id} className="text-gray-900">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSwap}
        className="mt-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:bg-white/20 transition-colors shrink-0"
        aria-label="Swap origin and destination"
      >
        &#8646;
      </button>

      <div className="flex-1">
        <label className="text-xs text-gray-400 block mb-1">To</label>
        <select
          value={destination}
          onChange={handleDestinationChange}
          className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:border-ember-green"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id} className="text-gray-900">
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
