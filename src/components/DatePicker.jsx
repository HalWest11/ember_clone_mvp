function isSameDay(a, b) {
  const opts = { timeZone: "Europe/London" };
  return (
    a.toLocaleDateString("en-GB", opts) === b.toLocaleDateString("en-GB", opts)
  );
}

function formatDay(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "Europe/London",
  });
}

function formatDayNumber(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    timeZone: "Europe/London",
  });
}

export default function DatePicker({ selectedDate, onDateChange }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-1.5 w-full">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onDateChange(day)}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? "bg-ember-green text-white"
                : "bg-white/10 text-white border border-white/20"
            }`}
          >
            <span className="text-xs">{isToday ? "Today" : formatDay(day)}</span>
            <span className="text-base font-semibold">{formatDayNumber(day)}</span>
          </button>
        );
      })}
    </div>
  );
}
