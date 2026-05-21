import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

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

const CATEGORY_COLORS = {
  Food: { bg: "#e8601c", emoji: "🍚" },
  Retail: { bg: "#3b82f6", emoji: "🛍️" },
  Services: { bg: "#8b5cf6", emoji: "🔧" },
  Health: { bg: "#ef4444", emoji: "💊" },
  Education: { bg: "#10b981", emoji: "📚" },
  Others: { bg: "#6b7280", emoji: "✨" },
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
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

// Component to fly map to a position
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1.2 });
  }, [position, map]);
  return null;
}

function Home() {
  const { dark } = useTheme();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [nearMe, setNearMe] = useState(null);
  const [locating, setLocating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  const handleNearMe = () => {
    if (!navigator.geolocation)
      return alert("Geolocation not supported on your browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        alert("Could not get your location. Please allow location access.");
        setLocating(false);
      },
    );
  };
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    API.get("/businesses?page=1&limit=12")
      .then((res) => {
        setBusinesses(res.data.businesses);
        setHasMore(res.data.hasMore);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    API.get(`/businesses?page=${nextPage}&limit=12`)
      .then((res) => {
        setBusinesses((prev) => [...prev, ...res.data.businesses]);
        setHasMore(res.data.hasMore);
        setPage(nextPage);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  };

  // ── Debounced AI search via Node backend ─────────────────────
  const runAiSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setAiResult(null);
      setActiveCategory("All");
      setPage(1);
      API.get("/businesses?page=1&limit=12")
        .then((res) => { setBusinesses(res.data.businesses); setHasMore(res.data.hasMore); })
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
      setPage(1);
      API.get("/businesses?page=1&limit=12")
        .then((res) => { setBusinesses(res.data.businesses); setHasMore(res.data.hasMore); })
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
  const styles = getStyles(dark);
  return (
    <div
      style={{
        backgroundColor: dark ? "#1a1208" : "#fdf8f3",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
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
              placeholder="Search businesses in Tarlac..."
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

      <main style={styles.content}>
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <button
            style={locating ? styles.nearMeBtnLoading : styles.nearMeBtn}
            onClick={handleNearMe}
            disabled={locating}
          >
            {locating ? "📡 Locating..." : "📍 Near me"}
          </button>
        </div>
        <div style={styles.mapWrap}>
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
            {nearMe && <FlyToLocation position={nearMe} />}
            {nearMe && (
              <Marker
                position={nearMe}
                icon={L.divIcon({
                  html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.4)"></div>`,
                  className: "",
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                })}
              >
                <Popup>📍 You are here!</Popup>
              </Marker>
            )}
            {filtered
              .filter((b) => b.lat && b.lng)
              .map((b) => (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={createColoredMarker(b.category)}
                >
                  <Popup>
                    <strong>{b.name}</strong>
                    <br />
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      {b.category || "General"}
                    </span>
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
                {/* Cover photo or fallback gradient */}
                <div
                  style={{
                    ...styles.cardCover,
                    ...(b.cover_photo
                      ? { backgroundImage: `url(${b.cover_photo})` }
                      : {
                          background:
                            "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
                        }),
                  }}
                >
                  {!b.cover_photo && (
                    <span style={{ fontSize: "32px" }}>🛖</span>
                  )}
                  {b.is_verified && (
                    <span style={styles.verified}>✅ Verified</span>
                  )}
                  {b.category && (
                    <span style={styles.categoryTag}>{b.category}</span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{b.name}</h3>
                  {b.avg_rating ? (
                    <div style={styles.ratingRow}>
                      <span style={styles.stars}>
                        {"⭐".repeat(Math.round(b.avg_rating))}
                      </span>
                      <span style={styles.ratingNum}>{b.avg_rating}</span>
                      <span style={styles.reviewCount}>
                        ({b.review_count} review{b.review_count != 1 ? "s" : ""}
                        )
                      </span>
                    </div>
                  ) : (
                    <p style={styles.noRating}>No reviews yet</p>
                  )}
                  <p style={styles.cardDesc}>{b.description}</p>
                  <p style={styles.cardAddr}>📍 {b.address}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.ownerTag}>👤 {b.owner_name}</span>
                    <span style={styles.viewMore}>View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more */}
        {!aiResult && hasMore && (
          <div style={{ textAlign: "center", padding: "8px 0 32px" }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: "13px 40px",
                backgroundColor: loadingMore ? "#ccc" : "white",
                color: loadingMore ? "white" : dark ? "#f0e8df" : "#2d2413",
                border: dark ? "1.5px solid #4a3828" : "1.5px solid #e8e0d8",
                borderRadius: "50px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loadingMore ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                backgroundColor: dark ? "#2d2413" : "white",
              }}
            >
              {loadingMore ? "Loading..." : "Load more businesses"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark) {
  const TEXT = dark ? "#f0e8df" : "#2d2413";
  const SECONDARY = dark ? "#c8bfb4" : "#666";
  const MUTED = dark ? "#8a7a6a" : "#999";
  const CARD_BG = dark ? "#2d2413" : "white";
  const CARD_BORDER = dark ? "#4a3828" : "#f0e8df";
  const PILL_BG = dark ? "#2d2413" : "white";
  const PILL_BORDER = dark ? "#5a4030" : "#e0d5c8";
  const PILL_TEXT = dark ? "#c8bfb4" : "#555";

  return {
    hero: {
      background: "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      padding: "clamp(32px, 6vw, 64px) clamp(16px, 4vw, 24px) clamp(40px, 8vw, 80px)",
      color: "white",
    },
    heroInner: { maxWidth: "700px", margin: "0 auto", textAlign: "center", padding: "0 8px" },
    heroTitle: { fontSize: "clamp(26px, 5vw, 42px)", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px", color: "white" },
    heroEyebrow: { fontSize: "14px", letterSpacing: "2px", opacity: 0.8, marginBottom: "12px", textTransform: "uppercase", color: "white" },
    heroSub: { fontSize: "clamp(14px, 3vw, 18px)", opacity: 0.85, marginBottom: "32px", color: "white" },
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
    searchInput: { flex: 1, border: "none", outline: "none", fontSize: "16px", padding: "10px 0", backgroundColor: "transparent", color: "#2d2413" },
    clearBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#aaa", padding: "4px 8px" },
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
    ctaRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" },
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
    pills: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" },
    pill: {
      padding: "8px 18px",
      borderRadius: "50px",
      border: `1.5px solid ${PILL_BORDER}`,
      backgroundColor: PILL_BG,
      cursor: "pointer",
      fontSize: "14px",
      color: PILL_TEXT,
      fontWeight: "500",
      fontFamily: "Poppins, sans-serif",
    },
    pillActive: {
      padding: "8px 18px",
      borderRadius: "50px",
      border: `1.5px solid ${ORANGE}`,
      backgroundColor: dark ? "#3d1a00" : "#fff3ec",
      cursor: "pointer",
      fontSize: "14px",
      color: ORANGE,
      fontWeight: "700",
      fontFamily: "Poppins, sans-serif",
    },
    mapWrap: { marginBottom: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", borderRadius: "16px", overflow: "hidden" },
    nearMeBtn: {
      padding: "9px 20px",
      backgroundColor: dark ? "#1e2d3d" : "white",
      color: "#3b82f6",
      border: "1.5px solid #3b82f6",
      borderRadius: "50px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      boxShadow: "0 2px 8px rgba(59,130,246,0.15)",
    },
    nearMeBtnLoading: {
      padding: "9px 20px",
      backgroundColor: dark ? "#1a2535" : "#eff6ff",
      color: "#93c5fd",
      border: "1.5px solid #93c5fd",
      borderRadius: "50px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "not-allowed",
      fontFamily: "Poppins, sans-serif",
    },
    sectionHeader: { marginBottom: "20px" },
    sectionTitle: { fontSize: "22px", fontWeight: "700", color: TEXT },
    count: { fontWeight: "400", color: MUTED, fontSize: "18px" },
    empty: { textAlign: "center", padding: "60px 0", color: MUTED },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
    card: {
      backgroundColor: CARD_BG,
      borderRadius: "16px",
      overflow: "hidden",
      textDecoration: "none",
      color: "inherit",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${CARD_BORDER}`,
      display: "flex",
      flexDirection: "column",
    },
    cardCover: {
      height: "160px",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "12px",
      position: "relative",
    },
    cardBody: { padding: "16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
    verified: { fontSize: "11px", backgroundColor: "#eaf3de", color: "#3b6d11", padding: "3px 10px", borderRadius: "20px", fontWeight: "600", alignSelf: "flex-start" },
    categoryTag: { fontSize: "11px", backgroundColor: "rgba(0,0,0,0.45)", color: "white", padding: "3px 10px", borderRadius: "20px", fontWeight: "600", backdropFilter: "blur(4px)" },
    cardTitle: { fontSize: "16px", fontWeight: "700", color: TEXT, margin: 0 },
    cardDesc: { fontSize: "13px", color: SECONDARY, margin: 0, lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    cardAddr: { fontSize: "12px", color: MUTED, margin: 0 },
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" },
    ownerTag: { fontSize: "12px", color: MUTED },
    viewMore: { fontSize: "13px", color: ORANGE, fontWeight: "600" },
    ratingRow: { display: "flex", alignItems: "center", gap: "4px", margin: 0 },
    stars: { fontSize: "12px" },
    ratingNum: { fontSize: "13px", fontWeight: "700", color: TEXT },
    reviewCount: { fontSize: "12px", color: MUTED },
    noRating: { fontSize: "12px", color: MUTED, margin: 0, fontStyle: "italic" },
  };
}

export default Home;
