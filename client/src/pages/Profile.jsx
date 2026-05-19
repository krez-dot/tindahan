import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [saved, setSaved] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");

    Promise.all([
      API.get("/businesses/saved/all"),
      API.get("/reviews/user/mine"),
    ])
      .then(([savedRes, reviewsRes]) => {
        setSaved(savedRes.data);
        setReviews(reviewsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading profile... 🛖</p>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* Profile hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <h1 style={styles.name}>{user?.name}</h1>
          <p style={styles.email}>{user?.email}</p>
          <span style={styles.roleBadge}>
            {user?.role === "owner" ? "🏪 Business Owner" : "🛍️ Customer"}
          </span>
          <div style={{ marginTop: "20px" }}>
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Saved businesses */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            ❤️ Saved businesses {saved.length > 0 && `(${saved.length})`}
          </h2>
          {saved.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: "32px" }}>🤍</p>
              <p>No saved businesses yet!</p>
              <Link to="/" style={styles.browseBtn}>
                Browse businesses →
              </Link>
            </div>
          ) : (
            <div style={styles.grid}>
              {saved.map((b) => (
                <Link to={`/business/${b.id}`} key={b.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span style={styles.cardEmoji}>🛖</span>
                    {b.is_verified && <span style={styles.verified}>✅</span>}
                  </div>
                  <h3 style={styles.cardTitle}>{b.name}</h3>
                  <p style={styles.cardDesc}>{b.description}</p>
                  <p style={styles.cardAddr}>📍 {b.address}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews written */}
        {user?.role !== "owner" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              ✍️ My reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ fontSize: "32px" }}>⭐</p>
                <p>You haven't written any reviews yet!</p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {reviews.map((r) => (
                  <Link
                    to={`/business/${r.business_id}`}
                    key={r.id}
                    style={styles.reviewCard}
                  >
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewBusiness}>
                        {r.business_name}
                      </span>
                      <span style={styles.reviewStars}>
                        {"⭐".repeat(r.rating)}
                      </span>
                    </div>
                    <p style={styles.reviewBody}>{r.body}</p>
                    <p style={styles.reviewDate}>
                      {new Date(r.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
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
  loadingPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  loadingText: { fontSize: "18px", color: "#888" },
  hero: {
    background:
      "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
    padding: "48px 24px",
    color: "white",
    textAlign: "center",
  },
  heroInner: { maxWidth: "500px", margin: "0 auto" },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 auto 16px",
    border: "3px solid rgba(255,255,255,0.4)",
  },
  name: { fontSize: "28px", fontWeight: "800", marginBottom: "6px", color: "white" },
  email: { fontSize: "15px", opacity: 0.8, marginBottom: "12px" },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1.5px solid white",
    color: "white",
    padding: "10px 24px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "Poppins, sans-serif",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0e8df",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: DARK,
    marginBottom: "20px",
  },
  empty: {
    textAlign: "center",
    padding: "32px 0",
    color: "#888",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  browseBtn: {
    marginTop: "8px",
    color: ORANGE,
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fdf8f3",
    borderRadius: "16px",
    padding: "20px",
    textDecoration: "none",
    color: "inherit",
    border: "1px solid #f0e8df",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardTop: { display: "flex", justifyContent: "space-between" },
  cardEmoji: { fontSize: "24px" },
  verified: { fontSize: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: DARK, margin: 0 },
  cardDesc: { fontSize: "13px", color: "#666", margin: 0 },
  cardAddr: { fontSize: "12px", color: "#999", margin: 0 },
  reviewCard: {
    backgroundColor: "#fdf8f3",
    borderRadius: "14px",
    padding: "18px",
    textDecoration: "none",
    color: "inherit",
    border: "1px solid #f0e8df",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  reviewBusiness: { fontWeight: "700", fontSize: "15px", color: ORANGE },
  reviewStars: { fontSize: "14px" },
  reviewBody: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "6px",
  },
  reviewDate: { fontSize: "12px", color: "#aaa" },
};

export default Profile;
