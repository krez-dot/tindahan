import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLORS = {
  Food:      { bg: "#e8601c", emoji: "🍚" },
  Retail:    { bg: "#3b82f6", emoji: "🛍️" },
  Services:  { bg: "#8b5cf6", emoji: "🔧" },
  Health:    { bg: "#ef4444", emoji: "💊" },
  Education: { bg: "#10b981", emoji: "📚" },
  Others:    { bg: "#6b7280", emoji: "✨" },
};

const createColoredMarker = (category) => {
  const config = CATEGORY_COLORS[category] || { bg: "#6b7280", emoji: "🏪" };
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="41" rx="6" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 0 C8 0 0 8 0 18 C0 30 18 44 18 44 C18 44 36 30 36 18 C36 8 28 0 18 0Z"
            fill="${config.bg}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="18" r="10" fill="white" opacity="0.25"/>
      <text x="18" y="23" text-anchor="middle" font-size="13">${config.emoji}</text>
    </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] });
};

function MapBoundsTracker({ onBoundsChange }) {
  useMapEvents({
    moveend(e) {
      const b = e.target.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
    zoomend(e) {
      const b = e.target.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
  });
  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1.2 });
  }, [position, map]);
  return null;
}

function BusinessMap({ businesses, nearMe, dark, onBoundsChange }) {
  return (
    <MapContainer
      center={[15.4755, 120.596]}
      zoom={13}
      style={{ height: "380px", width: "100%", borderRadius: "16px" }}
    >
      <TileLayer
        url={dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      {onBoundsChange && <MapBoundsTracker onBoundsChange={onBoundsChange} />}
      {nearMe && <FlyToLocation position={nearMe} />}
      {nearMe && (
        <Marker
          position={nearMe}
          icon={L.divIcon({
            html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.4)"></div>`,
            className: "", iconSize: [18, 18], iconAnchor: [9, 9],
          })}
        >
          <Popup>📍 You are here!</Popup>
        </Marker>
      )}
      {businesses
        .filter((b) => b.lat && b.lng)
        .map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={createColoredMarker(b.category)}>
            <Popup>
              <strong>{b.name}</strong>
              <br />
              <span style={{ fontSize: "12px", color: "#888" }}>{b.category || "General"}</span>
              <br />
              {b.address}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

export default BusinessMap;
