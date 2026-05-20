import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../api/axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORIES = [
  "All",
  "Food",
  "Retail",
  "Services",
  "Health",
  "Education",
  "Others",
];

function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiResult, setAiResult] = useState(null); // parsed AI response
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    API.get("/businesses")
      .then((res) => {
        setBusinesses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Debounced AI search via Node backend ─────────────────────
  const runAiSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setAiResult(null);
      setActiveCategory("All");
      API.get("/businesses")
        .then((res) => setBusinesses(res.data))
        .catch(() => {});
      return;
    }
    setAiLoading(true);
    try {
      const res = await API.get(
        `/businesses/search/ai?q=${encodeURIComponent(query)}`,
      );
      const data = res.data; // { results: [...], ai_interpretation: {...} }
      setAiResult(data.ai_interpretation);
      if (data.ai_interpretation?.detected_categories?.length === 1) {
        setActiveCategory(data.ai_interpretation.detected_categories[0]);
      }
      // Use DB-filtered results if we got any, otherwise keep current list
      if (data.results?.length > 0) setBusinesses(data.results);
    } catch {
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Debounce: wait 400ms after user stops typing
  useEffect(() => {
    if (!search.trim()) {
      setAiResult(null);
      setActiveCategory("All");
      API.get("/businesses")
        .then((res) => setBusinesses(res.data))
        .catch(() => {});
      return;
    }
    const timer = setTimeout(() => runAiSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Category pill filter on top of AI results ─────────────────
  const filtered = businesses.filter((b) => {
    if (activeCategory === "All") return true;
    return b.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "#fdf8f3", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>🌺 Tarlac City, Philippines</p>
          <h1 style={styles.heroTitle}>
            Find the best local
            <br />
            businesses near you
          </h1>
          <p style={styles.heroSub}>
            Support your community. Discover hidden gems. Shop local! 🛖
          </p>

          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>{aiLoading ? "⏳" : "🔍"}</span>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Try: 'cheap breakfast near central' or 'salon sa tibag'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={styles.clearBtn}
                onClick={() => {
                  setSearch("");
                  setAiResult(null);
                  setActiveCategory("All");
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* AI understanding badge */}
          {aiResult && search && (
            <div style={styles.aiBadge}>
              <span style={styles.aiBadgeIcon}>🤖</span>
              <span>
                AI understood:{" "}
                {aiResult.detected_categories?.length > 0 && (
                  <strong>{aiResult.detected_categories.join(", ")}</strong>
                )}
                {aiResult.location_hints?.length > 0 && (
                  <>
                    {" "}
                    · 📍 <strong>{aiResult.location_hints.join(", ")}</strong>
                  </>
                )}
                {aiResult.price_hints && (
                  <>
                    {" "}
                    ·{" "}
                    {aiResult.price_hints === "budget"
                      ? "💰 budget-friendly"
                      : "💎 premium"}
                  </>
                )}
                {!aiResult.detected_categories?.length &&
                  !aiResult.location_hints?.length &&
                  !aiResult.price_hints && (
                    <span>
                      searching for "
                      <strong>{aiResult.suggested_search || search}</strong>"
                    </span>
                  )}
              </span>
            </div>
          )}

          {user?.role === "owner" && (
            <button
              style={styles.ctaBtn}
              onClick={() => navigate("/add-business")}
            >
              + List your business
            </button>
          )}
          {!user && (
            <div style={styles.ctaRow}>
              <span style={styles.ctaText}>Own a business?</span>
              <Link to="/register" style={styles.ctaBtn}>
                List it for free →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={styles.content}>
        {/* Category pills */}
        <div style={styles.pills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={activeCategory === cat ? styles.pillActive : styles.pill}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "All" && "🏪 "}
              {cat === "Food" && "🍚 "}
              {cat === "Retail" && "🛍️ "}
              {cat === "Services" && "🔧 "}
              {cat === "Health" && "💊 "}
              {cat === "Education" && "📚 "}
              {cat === "Others" && "✨ "}
              {cat}
            </button>
          ))}
        </div>

        {/* Map */}
        <div style={styles.mapWrap}>
          <MapContainer
            center={[15.4755, 120.596]}
            zoom={13}
            style={{ height: "380px", width: "100%", borderRadius: "16px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {businesses
              .filter((b) => b.lat && b.lng)
              .map((b) => (
                <Marker key={b.id} position={[b.lat, b.lng]}>
                  <Popup>
                    <strong>{b.name}</strong>
                    <br />
                    {b.address}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Listings */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {activeCategory === "All" ? "All businesses" : activeCategory}
            <span style={styles.count}> · {filtered.length} found</span>
          </h2>
        </div>

        {loading ? (
          <p style={{ color: "#888", padding: "24px 0" }}>
            Loading businesses...
          </p>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "40px" }}>🔍</p>
            <p>No businesses found. Try a different search!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((b) => (
              <Link to={`/business/${b.id}`} key={b.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.cardEmoji}>🛖</span>
                  {b.is_verified && (
                    <span style={styles.verified}>✅ Verified</span>
                  )}
                </div>
                <h3 style={styles.cardTitle}>{b.name}</h3>
                <p style={styles.cardDesc}>{b.description}</p>
                <p style={styles.cardAddr}>📍 {b.address}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.ownerTag}>👤 {b.owner_name}</span>
                  <span style={styles.viewMore}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";
const DARK = "#2d2413";

const styles = {
  hero: {
    background:
      "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
    padding: "64px 24px 80px",
    color: "white",
  },
  heroInner: { maxWidth: "700px", margin: "0 auto", textAlign: "center" },
  heroTitle: {
    fontSize: "42px",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "16px",
    color: "white",
  },
  heroEyebrow: {
    fontSize: "14px",
    letterSpacing: "2px",
    opacity: 0.8,
    marginBottom: "12px",
    textTransform: "uppercase",
    color: "white",
  },
  heroSub: {
    fontSize: "18px",
    opacity: 0.85,
    marginBottom: "32px",
    color: "white",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "50px",
    padding: "6px 20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    marginBottom: "16px",
  },
  searchIcon: { fontSize: "18px", marginRight: "10px" },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
    padding: "10px 0",
    backgroundColor: "transparent",
    color: DARK,
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#aaa",
    padding: "4px 8px",
  },
  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "50px",
    padding: "8px 20px",
    fontSize: "13px",
    color: "white",
    marginBottom: "20px",
  },
  aiBadgeIcon: { fontSize: "16px" },
  ctaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  ctaText: { opacity: 0.85, fontSize: "15px" },
  ctaBtn: {
    backgroundColor: "white",
    color: ORANGE,
    border: "none",
    padding: "12px 28px",
    borderRadius: "50px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  pills: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  pill: {
    padding: "8px 18px",
    borderRadius: "50px",
    border: "1.5px solid #e0d5c8",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    color: "#555",
    fontWeight: "500",
  },
  pillActive: {
    padding: "8px 18px",
    borderRadius: "50px",
    border: `1.5px solid ${ORANGE}`,
    backgroundColor: "#fff3ec",
    cursor: "pointer",
    fontSize: "14px",
    color: ORANGE,
    fontWeight: "700",
  },
  mapWrap: {
    marginBottom: "36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  sectionHeader: { marginBottom: "20px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", color: DARK },
  count: { fontWeight: "400", color: "#999", fontSize: "18px" },
  empty: { textAlign: "center", padding: "60px 0", color: "#888" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0e8df",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardEmoji: { fontSize: "28px" },
  verified: {
    fontSize: "12px",
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: DARK, margin: 0 },
  cardDesc: { fontSize: "14px", color: "#666", margin: 0, lineHeight: "1.5" },
  cardAddr: { fontSize: "13px", color: "#999", margin: 0 },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
  },
  ownerTag: { fontSize: "12px", color: "#aaa" },
  viewMore: { fontSize: "13px", color: ORANGE, fontWeight: "600" },
};

export default Home;
