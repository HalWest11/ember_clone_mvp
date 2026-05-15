import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchQuotes, fetchTrip } from "../api/ember";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchQuotes", () => {
  it("builds correct URL with origin, destination, and date range", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ quotes: [] }),
    });
    global.fetch = mockFetch;

    await fetchQuotes(13, 42, new Date("2026-06-01T12:00:00Z"));

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.pathname).toBe("/v1/quotes/");
    expect(url.searchParams.get("origin")).toBe("13");
    expect(url.searchParams.get("destination")).toBe("42");

    const from = new Date(url.searchParams.get("departure_date_from"));
    const to = new Date(url.searchParams.get("departure_date_to"));
    expect(from.getHours()).toBe(0);
    expect(to.getHours()).toBe(23);
  });

  it("returns the quotes array from response", async () => {
    const fakeQuotes = [{ id: 1 }, { id: 2 }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ quotes: fakeQuotes }),
    });

    const result = await fetchQuotes();
    expect(result).toEqual(fakeQuotes);
  });

  it("throws on HTTP error with status code", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchQuotes()).rejects.toThrow("Quotes API error: 500");
  });
});

describe("fetchTrip", () => {
  it("builds correct URL with trip UID", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ route: [] }),
    });
    global.fetch = mockFetch;

    await fetchTrip("abc-123");

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.pathname).toBe("/v1/trips/abc-123/");
  });

  it("throws on HTTP error with status code", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchTrip("bad-uid")).rejects.toThrow("Trip API error: 404");
  });
});
