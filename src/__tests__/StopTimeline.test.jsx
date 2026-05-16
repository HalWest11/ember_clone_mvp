import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import StopTimeline from "../components/StopTimeline";

afterEach(cleanup);

// Helper to build a stop object
function makeStop(id, name, region, { depScheduled, depActual, arrScheduled, arrActual, skipped = false } = {}) {
  return {
    location: { id, name, detailed_name: name, region_name: region },
    departure: depScheduled ? { scheduled: depScheduled, ...(depActual && { actual: depActual }) } : undefined,
    arrival: arrScheduled ? { scheduled: arrScheduled, ...(arrActual && { actual: arrActual }) } : undefined,
    skipped,
  };
}

// Three-stop route: Aberdeen -> Dundee -> Edinburgh
// Times in UTC, formatted in Europe/London
const baseStops = [
  makeStop(1, "Aberdeen", "Aberdeen", {
    depScheduled: "2026-06-01T08:00:00+01:00",
  }),
  makeStop(2, "Dundee", "Dundee", {
    depScheduled: "2026-06-01T09:00:00+01:00",
    arrScheduled: "2026-06-01T09:00:00+01:00",
  }),
  makeStop(3, "Edinburgh", "Edinburgh", {
    arrScheduled: "2026-06-01T10:30:00+01:00",
  }),
];

describe("StopTimeline", () => {
  it("shows scheduled time when no actual time exists", () => {
    render(<StopTimeline stops={baseStops} originId={2} destinationId={3} />);
    // Dundee departure at 09:00 should be visible
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("shows strikethrough scheduled and actual time when delayed", () => {
    const stops = [
      makeStop(1, "Aberdeen", "Aberdeen", {
        depScheduled: "2026-06-01T08:00:00+01:00",
        depActual: "2026-06-01T08:10:00+01:00",
      }),
      makeStop(2, "Dundee", "Dundee", {
        depScheduled: "2026-06-01T09:00:00+01:00",
      }),
      makeStop(3, "Edinburgh", "Edinburgh", {
        arrScheduled: "2026-06-01T10:30:00+01:00",
      }),
    ];

    const { container } = render(<StopTimeline stops={stops} originId={1} destinationId={3} />);

    // Scheduled 08:00 should have line-through
    const strikethrough = container.querySelector(".line-through");
    expect(strikethrough).toBeInTheDocument();
    expect(strikethrough.textContent).toBe("08:00");

    // Actual 08:10 should be shown
    expect(screen.getByText("08:10")).toBeInTheDocument();

    // Delay badge
    expect(screen.getByText("10m late")).toBeInTheDocument();
  });

  it("shows early badge when bus arrives early", () => {
    const stops = [
      makeStop(1, "Aberdeen", "Aberdeen", {
        depScheduled: "2026-06-01T08:00:00+01:00",
        depActual: "2026-06-01T07:55:00+01:00",
      }),
      makeStop(2, "Dundee", "Dundee", {
        depScheduled: "2026-06-01T09:00:00+01:00",
      }),
      makeStop(3, "Edinburgh", "Edinburgh", {
        arrScheduled: "2026-06-01T10:30:00+01:00",
      }),
    ];

    render(<StopTimeline stops={stops} originId={1} destinationId={3} />);
    expect(screen.getByText("5m early")).toBeInTheDocument();
  });

  it("shows 'On time' when actual matches scheduled", () => {
    const stops = [
      makeStop(1, "Aberdeen", "Aberdeen", {
        depScheduled: "2026-06-01T08:00:00+01:00",
        depActual: "2026-06-01T08:00:30+01:00", // 30s difference, within 1min threshold
      }),
      makeStop(2, "Dundee", "Dundee", {
        depScheduled: "2026-06-01T09:00:00+01:00",
      }),
      makeStop(3, "Edinburgh", "Edinburgh", {
        arrScheduled: "2026-06-01T10:30:00+01:00",
      }),
    ];

    render(<StopTimeline stops={stops} originId={1} destinationId={3} />);
    expect(screen.getByText("On time")).toBeInTheDocument();
  });

  it("shows 'Board here' label at the origin stop", () => {
    render(<StopTimeline stops={baseStops} originId={2} destinationId={3} />);
    expect(screen.getByText("Board here")).toBeInTheDocument();
  });
});
