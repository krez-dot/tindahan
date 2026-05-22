import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const BusinessMap = lazy(() => import("../components/BusinessMap"));

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
  const [mapBounds, setMapBounds] = useState(null);
  const [filterByMap, setFilterByMap] = useState(false);
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

    // Skip AI if fewer than 3 actual letters (ignores numbers, symbols, gibberish like "1dz")
    const letterCount = (query.match(/[a-zA-ZÀ-ɏ]/g) || []).length;
    if (letterCount < 3) return;

    setAiLoading(true);
    try {
      const res = await API.get(
        `/businesses/search/ai?q=${encodeURIComponent(query)}`,
      );
      const data = res.data;
      setAiResult(data.ai_interpretation);
      if (data.ai_interpretation?.detected_categories?.length === 1) {
        setActiveCategory(data.ai_interpretation.detected_categories[0]);
      }
      if (data.results?.length > 0) {
        setBusinesses(data.results);
      } else {
        // No results — reset to all businesses so the page isn't a dead end
        setAiResult({ ...data.ai_interpretation, noResults: true });
        API.get("/businesses?page=1&limit=12")
          .then((r) => { setBusinesses(r.data.businesses); setHasMore(r.data.hasMore); })
          .catch(() => {});
      }
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
    if (activeCategory !== "All") {
      const cats = (b.categories || b.category || "").split(",").map((c) => c.trim().toLowerCase());
      if (!cats.includes(activeCategory.toLowerCase())) return false;
    }
    if (filterByMap && mapBounds && b.lat && b.lng) {
      if (b.lat < mapBounds.south || b.lat > mapBounds.north) return false;
      if (b.lng < mapBounds.west || b.lng > mapBounds.east) return false;
    }
    return true;
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
      <Helmet>
        <title>Tindahan — Find Local Businesses in Tarlac City</title>
        <meta name="description" content="Discover and support local businesses in Tarlac City, Philippines. Search for food, retail, services, health, and more." />
        <meta property="og:title" content="Tindahan — Local Business Directory, Tarlac City" />
        <meta property="og:description" content="Find the best local businesses near you in Tarlac City. Shop local, support your community!" />
      </Helmet>
      {/* Hero */}
      <div style={styles.hero} className="hero-tindahan">
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

          {/* AI understanding badge — only show if AI found something meaningful */}
          {aiResult && search && (aiResult.detected_categories?.length > 0 || aiResult.location_hints?.length > 0 || aiResult.price_hints) && (
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
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={filterByMap ? styles.mapFilterBtnActive : styles.mapFilterBtn}
            onClick={() => setFilterByMap((v) => !v)}
          >
            🗺️ {filterByMap ? "Filtering by map area" : "Filter by map area"}
          </button>
          <button
            style={locating ? styles.nearMeBtnLoading : styles.nearMeBtn}
            onClick={handleNearMe}
            disabled={locating}
          >
            {locating ? "📡 Locating..." : "📍 Near me"}
          </button>
        </div>
        <div style={styles.mapWrap}>
          <Suspense fallback={
            <div style={{ height: "380px", borderRadius: "16px", backgroundColor: dark ? "#2d2413" : "#f0ebe3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: dark ? "#8a7a6a" : "#aaa" }}>
              Loading map...
            </div>
          }>
            <BusinessMap businesses={filtered} nearMe={nearMe} dark={dark} onBoundsChange={setMapBounds} />
          </Suspense>
        </div>

        {/* Listings */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {activeCategory === "All" ? "All businesses" : activeCategory}
            <span style={styles.count}> · {filtered.length} found</span>
          </h2>
        </div>

        {/* No-results banner — shows above the full list as a fallback */}
        {aiResult?.noResults && (
          <div style={{ backgroundColor: dark ? "#2d2413" : "#fff8f3", border: `1px solid ${dark ? "#4a3828" : "#fad4bc"}`, borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>🔍</span>
            <div>
              <p style={{ fontWeight: "600", fontSize: "14px", color: dark ? "#f0e8df" : "#2d2413" }}>No exact matches for "{search}"</p>
              <p style={{ fontSize: "13px", color: dark ? "#8a7a6a" : "#aaa", marginTop: "2px" }}>Showing all businesses instead</p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonCover} />
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ ...styles.skeletonLine, width: "70%" }} />
                  <div style={{ ...styles.skeletonLine, width: "40%", height: "12px" }} />
                  <div style={{ ...styles.skeletonLine, width: "90%", height: "12px" }} />
                  <div style={{ ...styles.skeletonLine, width: "55%", height: "12px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "40px" }}>🏪</p>
            <p>No businesses in this category yet.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((b) => (
              <Link to={`/business/${b.id}`} key={b.id} style={styles.card} className="card-hover">
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
                  {(b.categories || b.category) && (
                    <span style={styles.categoryTag}>
                      {(b.categories || b.category).split(",")[0].trim()}
                    </span>
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
          <div style={{ textAlign: "center", padding: "8px 0 40px" }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: "13px 44px",
                backgroundColor: "transparent",
                color: loadingMore ? (dark ? "#6a5a4a" : "#ccc") : "#e8601c",
                border: loadingMore
                  ? `2px solid ${dark ? "#4a3828" : "#e8e0d8"}`
                  : "2px solid #e8601c",
                borderRadius: "50px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loadingMore ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif",
                transition: "opacity 0.15s",
                opacity: loadingMore ? 0.5 : 1,
              }}
            >
              {loadingMore ? "Loading..." : "Load more →"}
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
    heroInner: { maxWidth: "700px", margin: "0 auto", textAlign: "center", padding: "0 8px", position: "relative", zIndex: 1 },
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
    mapWrap: { marginBottom: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", borderRadius: "18px", overflow: "hidden", border: dark ? "1.5px solid #3d2c1e" : "1.5px solid #e8e0d8" },
    mapFilterBtn: {
      padding: "9px 20px",
      backgroundColor: dark ? "#2d2413" : "white",
      color: dark ? "#c8bfb4" : "#555",
      border: dark ? "1.5px solid #5a4030" : "1.5px solid #e0d5c8",
      borderRadius: "50px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    mapFilterBtnActive: {
      padding: "9px 20px",
      backgroundColor: dark ? "#3d1a00" : "#fff3ec",
      color: ORANGE,
      border: `1.5px solid ${ORANGE}`,
      borderRadius: "50px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
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
    skeletonCard: {
      backgroundColor: dark ? "#2d2413" : "white",
      borderRadius: "18px",
      overflow: "hidden",
      border: dark ? "1px solid #4a3828" : "1px solid #f0e8df",
    },
    skeletonCover: {
      width: "100%", height: "160px",
      backgroundColor: dark ? "#3d2c1e" : "#f0ebe3",
      animation: "pulse 1.5s ease-in-out infinite",
    },
    skeletonLine: {
      height: "14px", borderRadius: "6px",
      backgroundColor: dark ? "#3d2c1e" : "#f0ebe3",
      animation: "pulse 1.5s ease-in-out infinite",
    },
  };
}

export default Home;
