import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon bug in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/businesses")
      .then((res) => {
        setBusinesses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: "24px" }}>Loading businesses...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛖 Discover Local Businesses in Tarlac</h1>
      <p style={styles.subtitle}>Support your community, shop local!</p>

      <MapContainer
  center={[15.4755, 120.5960]}
  zoom={13}
  style={{ height: "400px", width: "100%", borderRadius: "12px", marginBottom: "32px" }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {businesses.filter(b => b.lat && b.lng).map(b => (
    <Marker key={b.id} position={[b.lat, b.lng]}>
      <Popup>
        <strong>{b.name}</strong><br />
        {b.address}
      </Popup>
    </Marker>
  ))}
</MapContainer>

      {businesses.length === 0 ? (
        <p>No businesses yet. Be the first to add one!</p>
      ) : (
        <div style={styles.grid}>
          {businesses.map((b) => (
            <Link to={`/business/${b.id}`} key={b.id} style={styles.card}>
              <h2 style={styles.cardTitle}>{b.name}</h2>
              <p style={styles.cardDesc}>{b.description}</p>
              <p style={styles.cardAddr}>📍 {b.address}</p>
              {b.is_verified && <span style={styles.badge}>✅ Verified</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "1100px", margin: "0 auto" },
  title: { fontSize: "28px", marginBottom: "8px" },
  subtitle: { color: "#666", marginBottom: "32px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "20px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "transform 0.2s",
  },
  cardTitle: { fontSize: "18px", marginBottom: "8px", color: "#2d2d2d" },
  cardDesc: { fontSize: "14px", color: "#666", marginBottom: "12px" },
  cardAddr: { fontSize: "13px", color: "#888" },
  badge: {
    display: "inline-block",
    marginTop: "10px",
    fontSize: "12px",
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "3px 10px",
    borderRadius: "20px",
  },
};

export default Home;
