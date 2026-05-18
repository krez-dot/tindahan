import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/businesses/${id}`)
      .then((res) => {
        setBusiness(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading business... 🛖</p>
      </div>
    );

  if (!business)
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Business not found 😢</p>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* Hero banner */}
      <div style={styles.banner}>
        <div style={styles.bannerInner}>
          <button style={styles.backLink} onClick={() => navigate("/")}>
            ← Back
          </button>
          <div style={styles.bannerEmoji}>🛖</div>
          <h1 style={styles.bannerTitle}>{business.name}</h1>
          {business.is_verified && (
            <span style={styles.verifiedBadge}>✅ Verified Business</span>
          )}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.main}>
          {/* About section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>About this business</h2>
            <p style={styles.description}>
              {business.description || "No description provided."}
            </p>
          </div>

          {/* Details section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Business details</h2>
            <div style={styles.detailsList}>
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>📍</span>
                <div>
                  <p style={styles.detailLabel}>Address</p>
                  <p style={styles.detailValue}>
                    {business.address || "Not provided"}
                  </p>
                </div>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>📞</span>
                <div>
                  <p style={styles.detailLabel}>Phone</p>
                  <p style={styles.detailValue}>
                    {business.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>👤</span>
                <div>
                  <p style={styles.detailLabel}>Owner</p>
                  <p style={styles.detailValue}>{business.owner_name}</p>
                </div>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>📅</span>
                <div>
                  <p style={styles.detailLabel}>Listed on</p>
                  <p style={styles.detailValue}>
                    {new Date(business.created_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Contact this business</h3>
            {business.phone ? (
              <a href={`tel:${business.phone}`} style={styles.contactBtn}>
                📞 Call {business.phone}
              </a>
            ) : (
              <p style={styles.noContact}>No phone number listed</p>
            )}
          </div>

          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Location</h3>
            <p style={styles.locationText}>
              📍 {business.address || "Address not available"}
            </p>
            {business.lat && business.lng && (
              <a
                href={`https://www.google.com/maps?q=${business.lat},${business.lng}`}
                target="_blank"
                rel="noreferrer"
                style={styles.mapsBtn}
              >
                🗺️ Open in Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";
const DARK = "#2d2413";

const styles = {
  page: { backgroundColor: "#fdf8f3", minHeight: "100vh" },
  loadingPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "16px",
  },
  loadingText: { fontSize: "18px", color: "#888" },
  backBtn: {
    padding: "10px 24px",
    backgroundColor: ORANGE,
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "600",
  },
  banner: {
    background:
      "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
    padding: "48px 24px",
    color: "white",
  },
  bannerInner: { maxWidth: "900px", margin: "0 auto" },
  backLink: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    marginBottom: "20px",
    display: "inline-block",
  },
  bannerEmoji: { fontSize: "48px", marginBottom: "12px" },
  bannerTitle: {
    fontSize: "36px",
    fontWeight: "800",
    marginBottom: "12px",
    color: "white",
  },
  verifiedBadge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  content: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  main: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0e8df",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: DARK,
    marginBottom: "16px",
  },
  description: { fontSize: "15px", color: "#555", lineHeight: "1.8" },
  detailsList: { display: "flex", flexDirection: "column", gap: "16px" },
  detailRow: { display: "flex", gap: "16px", alignItems: "flex-start" },
  detailIcon: { fontSize: "22px", marginTop: "2px" },
  detailLabel: {
    fontSize: "12px",
    color: "#aaa",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  detailValue: { fontSize: "15px", color: DARK, fontWeight: "500" },
  sidebar: { display: "flex", flexDirection: "column", gap: "16px" },
  sideCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0e8df",
  },
  sideCardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: DARK,
    marginBottom: "16px",
  },
  contactBtn: {
    display: "block",
    backgroundColor: ORANGE,
    color: "white",
    padding: "13px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "15px",
    textAlign: "center",
  },
  noContact: {
    fontSize: "14px",
    color: "#aaa",
    textAlign: "center",
    padding: "12px 0",
  },
  locationText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
    lineHeight: "1.6",
  },
  mapsBtn: {
    display: "block",
    border: `1.5px solid ${ORANGE}`,
    color: ORANGE,
    padding: "11px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default BusinessPage;
