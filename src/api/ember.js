const BASE = "https://api.ember.to/v1";
const REQUEST_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function fetchQuotes(origin = 13, destination = 42, date = new Date()) {
  if (!Number.isInteger(origin) || origin <= 0) {
    throw new Error("Invalid origin ID");
  }
  if (!Number.isInteger(destination) || destination <= 0) {
    throw new Error("Invalid destination ID");
  }
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date");
  }

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

  const res = await fetchWithTimeout(`${BASE}/quotes/?${params}`);
  if (!res.ok) throw new Error(`Quotes API error: ${res.status}`);
  const data = await res.json();
  return data.quotes;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchTrip(tripUid) {
  if (typeof tripUid !== "string" || !UUID_RE.test(tripUid)) {
    throw new Error("Invalid trip UID");
  }

  const res = await fetchWithTimeout(`${BASE}/trips/${tripUid}/`);
  if (!res.ok) throw new Error(`Trip API error: ${res.status}`);
  return res.json();
}
