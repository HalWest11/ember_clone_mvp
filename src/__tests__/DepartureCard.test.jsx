import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DepartureCard from "../components/DepartureCard";

// Build a quote matching the real API shape
function makeQuote({ pricePence = 1250, seats = 25 } = {}) {
  return {
    legs: [
      {
        trip_uid: "test-trip-123",
        departure: { scheduled: "2026-06-01T09:00:00+01:00" },
        arrival: { scheduled: "2026-06-01T10:30:00+01:00" },
        origin: { id: 13, name: "Dundee", detailed_name: "Dundee City Centre" },
        destination: { id: 42, name: "Edinburgh", detailed_name: "Edinburgh Bus Station" },
        description: {
          destination_board: "E1",
          amenities: { has_wifi: true, has_toilet: true },
        },
      },
    ],
    prices: { concession: pricePence },
    availability: { seat: seats },
    bookable: true,
  };
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <DepartureCard quote={makeQuote(props)} />
    </MemoryRouter>
  );
}

describe("DepartureCard", () => {
  it("formats price from pence to pounds", () => {
    renderCard({ pricePence: 1250 });
    expect(screen.getByText("£12.50")).toBeInTheDocument();
  });

  it("shows 'Free' for zero concession price", () => {
    renderCard({ pricePence: 0 });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows green seat indicator for >20 seats", () => {
    const { container } = renderCard({ seats: 25 });
    const dot = container.querySelector(".bg-green-500");
    expect(dot).toBeInTheDocument();
  });

  it("shows red seat indicator for <=5 seats", () => {
    const { container } = renderCard({ seats: 3 });
    const dot = container.querySelector(".bg-red-500");
    expect(dot).toBeInTheDocument();
  });
});
