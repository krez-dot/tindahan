import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [saved, setSaved] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    API.get(`/businesses/${id}`)
      .then((res) => {
        setBusiness(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    API.get(`/reviews/${id}`).then((res) => setReviews(res.data));
  }, [id]);

  useEffect(() => {
    API.get(`/upload/${id}`).then((res) => setPhotos(res.data));
  }, [id]);

  useEffect(() => {
    if (user) {
      API.get(`/businesses/${id}/saved`)
        .then((res) => setSaved(res.data.saved))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    API.get(`/announcements/${id}`).then((res) => setAnnouncements(res.data));
  }, [id]);

  const fetchReviews = () => {
    API.get(`/reviews/${id}`).then((res) => setReviews(res.data));
  };

  const toggleSave = async () => {
    if (!user) return navigate("/login");
    const res = await API.post(`/businesses/${id}/save`);
    setSaved(res.data.saved);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      await API.post(`/reviews/${id}`, reviewForm);
      setReviewSuccess(true);
      setReviewForm({ rating: 5, body: "" });
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review");
    }
  };

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
          <div style={{ marginTop: "16px" }}>
            <button
              onClick={toggleSave}
              style={saved ? styles.savedBtn : styles.saveBtn}
            >
              {saved ? "❤️ Saved!" : "🤍 Save business"}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* About */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>About this business</h2>
          <p style={styles.description}>
            {business.description || "No description provided."}
          </p>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📢 Announcements</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {announcements.map((a) => (
                <div key={a.id} style={styles.announcementCard}>
                  <p style={styles.announcementTitle}>{a.title}</p>
                  {a.body && <p style={styles.announcementBody}>{a.body}</p>}
                  <p style={styles.announcementDate}>
                    {new Date(a.created_at).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📸 Photos</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {photos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt="business"
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details */}
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

        {/* Contact */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Contact this business</h2>
          {business.phone ? (
            <a href={`tel:${business.phone}`} style={styles.contactBtn}>
              📞 Call {business.phone}
            </a>
          ) : (
            <p style={styles.noContact}>No phone number listed</p>
          )}
          {business.lat && business.lng && (
            <a
              href={`https://www.google.com/maps?q=${business.lat},${business.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{ ...styles.mapsBtn, marginTop: "12px" }}
            >
              🗺️ Open in Google Maps
            </a>
          )}
        </div>

        {/* Reviews list */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            ⭐ Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "14px" }}>
              No reviews yet. Be the first!
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {reviews.map((r) => (
                <div key={r.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewerName}>
                      👤 {r.reviewer_name}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a review */}
        {user && user.role !== "owner" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>✍️ Write a review</h2>
            {reviewSuccess && (
              <div style={styles.success}>✅ Review submitted! Salamat!</div>
            )}
            {reviewError && <div style={styles.error}>⚠️ {reviewError}</div>}
            <form onSubmit={submitReview}>
              <label style={styles.label}>Rating</label>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    style={{
                      fontSize: "24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      opacity: reviewForm.rating >= star ? 1 : 0.3,
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <label style={styles.label}>Your review</label>
              <textarea
                style={styles.textarea}
                placeholder="Share your experience with this business..."
                value={reviewForm.body}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, body: e.target.value })
                }
                rows={4}
                required
              />
              <button type="submit" style={styles.btn}>
                Submit review →
              </button>
            </form>
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
  bannerInner: { maxWidth: "720px", margin: "0 auto" },
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
  saveBtn: {
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
  savedBtn: {
    backgroundColor: "white",
    border: "none",
    color: ORANGE,
    padding: "10px 24px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "Poppins, sans-serif",
  },
  content: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
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
  announcementCard: {
    backgroundColor: "#fff3ec",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #fad4bc",
  },
  announcementTitle: {
    fontWeight: "700",
    fontSize: "15px",
    color: DARK,
    marginBottom: "6px",
  },
  announcementBody: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "6px",
  },
  announcementDate: { fontSize: "12px", color: "#aaa" },
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
  reviewCard: {
    backgroundColor: "#fdf8f3",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #f0e8df",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  reviewerName: { fontWeight: "600", fontSize: "14px", color: DARK },
  reviewStars: { fontSize: "14px" },
  reviewBody: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  reviewDate: { fontSize: "12px", color: "#aaa" },
  success: {
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  error: {
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
  },
  textarea: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e8e0d8",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Poppins, sans-serif",
    color: DARK,
    backgroundColor: "#fdfaf7",
    resize: "vertical",
    marginBottom: "16px",
  },
  btn: {
    padding: "13px 32px",
    backgroundColor: ORANGE,
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  },
};

export default BusinessPage;
