import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function Announcements() {
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

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>📢 Announcements</h1>
          <p style={styles.heroSub}>
            Latest updates from local businesses in Tarlac!
          </p>
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "40px" }}>📢</p>
            <p>No announcements yet. Check back soon!</p>
            <Link to="/" style={styles.browseBtn}>
              Browse businesses →
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {announcements.map((a) => (
              <Link
                to={`/business/${a.business_id}`}
                key={a.id}
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.businessName}>🛖 {a.business_name}</span>
                  <span style={styles.date}>
                    {new Date(a.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 style={styles.title}>{a.title}</h3>
                {a.body && <p style={styles.body}>{a.body}</p>}
                {a.expires_at && (
                  <span style={styles.expiresTag}>
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
const DARK = "#2d2413";

const styles = {
  page: { backgroundColor: "#fdf8f3", minHeight: "100vh" },
  hero: {
    background:
      "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
    padding: "48px 24px",
    color: "white",
  },
  heroInner: { maxWidth: "900px", margin: "0 auto" },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "8px",
    color: "white",
  },
  heroSub: { fontSize: "16px", opacity: 0.85 },
  content: { maxWidth: "900px", margin: "0 auto", padding: "32px 24px" },
  empty: {
    textAlign: "center",
    padding: "60px 0",
    color: "#888",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  browseBtn: {
    color: ORANGE,
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "15px",
  },
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
    border: "1px solid #f0e8df",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  businessName: { fontSize: "13px", fontWeight: "600", color: ORANGE },
  date: { fontSize: "12px", color: "#aaa" },
  title: { fontSize: "16px", fontWeight: "700", color: DARK, margin: 0 },
  body: { fontSize: "14px", color: "#555", lineHeight: "1.6", margin: 0 },
  expiresTag: {
    fontSize: "12px",
    backgroundColor: "#fff3ec",
    color: ORANGE,
    padding: "3px 10px",
    borderRadius: "20px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
};

export default Announcements;
