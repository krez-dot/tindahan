import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Announcements() {
  const { dark } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/announcements")
      .then((res) => {
        setAnnouncements(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const s = getStyles(dark);

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>📢 Announcements</h1>
          <p style={s.heroSub}>Latest updates from local businesses in Tarlac!</p>
        </div>
      </div>

      <div style={s.content}>
        {loading ? (
          <p style={{ color: dark ? "#8a7a6a" : "#aaa" }}>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: "40px" }}>📢</p>
            <p>No announcements yet. Check back soon!</p>
            <Link to="/" style={s.browseBtn}>Browse businesses →</Link>
          </div>
        ) : (
          <div style={s.grid}>
            {announcements.map((a) => (
              <Link to={`/business/${a.business_id}`} key={a.id} style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.businessName}>🛖 {a.business_name}</span>
                  <span style={s.date}>
                    {new Date(a.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 style={s.title}>{a.title}</h3>
                {a.body && <p style={s.body}>{a.body}</p>}
                {a.expires_at && (
                  <span style={s.expiresTag}>
                    Expires{" "}
                    {new Date(a.expires_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark) {
  const TEXT = dark ? "#f0e8df" : "#2d2413";
  const SECONDARY = dark ? "#c8bfb4" : "#555";
  const MUTED = dark ? "#8a7a6a" : "#aaa";
  const CARD_BG = dark ? "#2d2413" : "white";
  const CARD_BORDER = dark ? "#4a3828" : "#f0e8df";
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";

  return {
    page: { backgroundColor: PAGE_BG, minHeight: "100vh" },
    hero: {
      background: "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      padding: "48px 24px",
      color: "white",
    },
    heroInner: { maxWidth: "900px", margin: "0 auto" },
    heroTitle: { fontSize: "32px", fontWeight: "800", marginBottom: "8px", color: "white" },
    heroSub: { fontSize: "16px", opacity: 0.85 },
    content: { maxWidth: "900px", margin: "0 auto", padding: "32px 24px" },
    empty: {
      textAlign: "center",
      padding: "60px 0",
      color: MUTED,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
    },
    browseBtn: { color: ORANGE, fontWeight: "700", textDecoration: "none", fontSize: "15px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
    },
    card: {
      backgroundColor: CARD_BG,
      borderRadius: "16px",
      padding: "24px",
      textDecoration: "none",
      color: "inherit",
      border: `1px solid ${CARD_BORDER}`,
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    businessName: { fontSize: "13px", fontWeight: "600", color: ORANGE },
    date: { fontSize: "12px", color: MUTED },
    title: { fontSize: "16px", fontWeight: "700", color: TEXT, margin: 0 },
    body: { fontSize: "14px", color: SECONDARY, lineHeight: "1.6", margin: 0 },
    expiresTag: {
      fontSize: "12px",
      backgroundColor: dark ? "#3d1a00" : "#fff3ec",
      color: ORANGE,
      padding: "3px 10px",
      borderRadius: "20px",
      fontWeight: "600",
      alignSelf: "flex-start",
    },
  };
}

export default Announcements;
