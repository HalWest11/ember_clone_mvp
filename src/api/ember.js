const BASE = "https://api.ember.to/v1";

export async function fetchQuotes(origin = 13, destination = 42, date = new Date()) {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 0);

  const params = new URLSearchParams({
    origin,
    destination,
    departure_date_from: from.toISOString(),
    departure_date_to: to.toISOString(),
  });

  const res = await fetch(`${BASE}/quotes/?${params}`);
  if (!res.ok) throw new Error(`Quotes API error: ${res.status}`);
  const data = await res.json();
  return data.quotes;
}

export async function fetchTrip(tripUid) {
  const res = await fetch(`${BASE}/trips/${tripUid}/`);
  if (!res.ok) throw new Error(`Trip API error: ${res.status}`);
  return res.json();
}
