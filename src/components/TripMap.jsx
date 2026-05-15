import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Custom marker icons using simple SVG data URIs
function makeIcon(color, size = 12) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  });
}

const greenIcon = makeIcon("#2ab34a", 16);
const redIcon = makeIcon("#ef4444", 16);
const grayIcon = makeIcon("#9ca3af", 10);

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [30, 30] });
    }
  }, [map, positions]);
  return null;
}

function busIcon(heading) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#2ab34a;border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;color:white;
      transform:rotate(${heading ?? 0}deg)
    ">&#9650;</div>`,
  });
}

export default function TripMap({ stops, originId, destinationId, vehicleGps }) {
  const positions = stops
    .filter((s) => !s.skipped)
    .map((s) => [s.location.lat, s.location.lon]);

  if (positions.length === 0) return null;

  return (
    <MapContainer
      center={positions[0]}
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />

      {/* Route line */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "#2ab34a", weight: 4, opacity: 0.8 }}
      />

      {/* Stop markers */}
      {stops
        .filter((s) => !s.skipped)
        .map((stop) => {
          const isOrigin = stop.location.id === originId;
          const isDest = stop.location.id === destinationId;
          const icon = isOrigin ? greenIcon : isDest ? redIcon : grayIcon;
          return (
            <Marker
              key={stop.location.id}
              position={[stop.location.lat, stop.location.lon]}
              icon={icon}
            />
          );
        })}
      {/* Live bus marker */}
      {vehicleGps && vehicleGps.latitude && (
        <Marker
          position={[vehicleGps.latitude, vehicleGps.longitude]}
          icon={busIcon(vehicleGps.heading)}
          zIndexOffset={1000}
        />
      )}
    </MapContainer>
  );
}
