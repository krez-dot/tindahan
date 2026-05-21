import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function ReplyForm({ reviewId, onReplied, dark }) {
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await API.post(`/reviews/${reviewId}/reply`, { reply });
    setReply("");
    setSubmitting(false);
    onReplied();
  };

  return (
    <form onSubmit={submit} style={{ marginTop: "14px" }}>
      <textarea
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "10px",
          border: dark ? "1.5px solid #5a4030" : "1.5px solid #e8e0d8",
          fontSize: "14px",
          fontFamily: "Poppins, sans-serif",
          resize: "vertical",
          boxSizing: "border-box",
          backgroundColor: dark ? "#3d2c1e" : "#fafaf8",
          color: dark ? "#f0e8df" : "#2d2413",
          outline: "none",
        }}
        placeholder="Reply to this review..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={2}
        required
      />
      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: "8px",
          padding: "8px 20px",
          backgroundColor: "#e8601c",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {submitting ? "Replying..." : "Reply →"}
      </button>
    </form>
  );
}

function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [saved, setSaved] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    API.get(`/businesses/${id}`)
      .then((res) => { setBusiness(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { API.get(`/reviews/${id}`).then((res) => setReviews(res.data)); }, [id]);
  useEffect(() => { API.get(`/upload/${id}`).then((res) => setPhotos(res.data)); }, [id]);
  useEffect(() => { API.get(`/announcements/${id}`).then((res) => setAnnouncements(res.data)); }, [id]);
  useEffect(() => {
    if (user) API.get(`/businesses/${id}/saved`).then((res) => setSaved(res.data.saved)).catch(() => {});
  }, [id]);

  const fetchReviews = () => API.get(`/reviews/${id}`).then((res) => setReviews(res.data));

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

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const coverPhoto = photos.length > 0 ? photos[0].url : null;
  const s = getStyles(dark, isMobile);

  if (loading)
    return (
      <div style={s.loadingPage}>
        <p style={s.loadingText}>Loading business... 🛖</p>
      </div>
    );

  if (!business)
    return (
      <div style={s.loadingPage}>
        <p style={s.loadingText}>Business not found 😢</p>
        <button style={s.orangeBtn} onClick={() => navigate("/")}>← Back to home</button>
      </div>
    );

  return (
    <div style={s.page}>

      {/* ── Banner ── */}
      <div style={{
        ...s.banner,
        backgroundImage: coverPhoto
          ? `url(${coverPhoto})`
          : "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      }}>
        <div style={s.bannerOverlay} />

        {/* Back button — absolute top-left */}
        <button style={s.backBtn} onClick={() => navigate("/")}>← Back</button>

        {/* Glass strip at bottom */}
        <div style={s.glassStrip}>
          <div style={s.stripLeft}>
            {business.category && (
              <span style={s.catLabel}>{business.category}</span>
            )}
            <h1 style={s.bizName}>{business.name}</h1>
            <div style={s.stripMeta}>
              {business.is_verified && <span style={s.metaChip}>✅ Verified</span>}
              {avgRating && (
                <span style={s.metaChip}>
                  {"⭐".repeat(Math.round(avgRating))} {avgRating}
                  <span style={{ opacity: 0.75, fontWeight: 400 }}> ({reviews.length} reviews)</span>
                </span>
              )}
            </div>
          </div>

          <div style={s.stripActions}>
            {business.phone && (
              <a href={`tel:${business.phone}`} style={s.iconBtn} aria-label={`Call ${business.name}`}>📞</a>
            )}
            {business.lat && business.lng && (
              <a
                href={`https://www.google.com/maps?q=${business.lat},${business.lng}`}
                target="_blank"
                rel="noreferrer"
                style={s.iconBtn}
                aria-label={`Open ${business.name} in Google Maps`}
              >🗺️</a>
            )}
            <button onClick={toggleSave} style={saved ? s.iconBtnSaved : s.iconBtn} aria-label={saved ? "Unsave business" : "Save business"}>
              {saved ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div style={s.lightbox} onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="full" style={s.lightboxImg} />
          <button style={s.lightboxClose} onClick={() => setSelectedPhoto(null)}>✕</button>
        </div>
      )}

      {/* ── Content ── */}
      <main style={s.content}>

        {/* About */}
        <section style={s.section}>
          <p style={s.sectionHead}>About</p>
          <p style={s.body}>{business.description || "No description provided."}</p>
        </section>

        <div style={s.divider} />

        {/* Details */}
        <section style={s.section}>
          <p style={s.sectionHead}>Details</p>
          <div style={s.detailsGrid}>
            {[
              { icon: "📍", label: "Address", value: business.address || "Not provided" },
              { icon: "📞", label: "Phone", value: business.phone || "Not provided" },
              { icon: "👤", label: "Owner", value: business.owner_name },
              { icon: "🏷️", label: "Category", value: business.category || "General" },
              {
                icon: "📅", label: "Listed on",
                value: new Date(business.created_at).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                }),
              },
            ].map(({ icon, label, value }) => (
              <div key={label} style={s.detailItem}>
                <span style={s.detailIcon}>{icon}</span>
                <div>
                  <p style={s.detailLabel}>{label}</p>
                  <p style={s.detailValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements */}
        {announcements.length > 0 && (
          <>
            <div style={s.divider} />
            <section style={s.section}>
              <p style={s.sectionHead}>Announcements</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {announcements.map((a) => (
                  <div key={a.id} style={s.announcementCard}>
                    <p style={s.announcementTitle}>{a.title}</p>
                    {a.body && <p style={s.announcementBody}>{a.body}</p>}
                    <p style={s.announcementDate}>
                      {new Date(a.created_at).toLocaleDateString("en-PH", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <>
            <div style={s.divider} />
            <section style={s.section}>
              <p style={s.sectionHead}>Photos ({photos.length})</p>
              <div style={s.photoGrid}>
                {photos.map((p, i) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={`${business.name} photo ${i + 1}`}
                    onClick={() => setSelectedPhoto(p.url)}
                    style={s.photoThumb}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <div style={s.divider} />

        {/* Reviews */}
        <section style={s.section}>
          <p style={s.sectionHead}>Reviews {reviews.length > 0 && `(${reviews.length})`}</p>
          {reviews.length === 0 ? (
            <p style={{ color: dark ? "#8a7a6a" : "#aaa", fontSize: "15px" }}>
              No reviews yet. Be the first!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {reviews.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    ...s.reviewItem,
                    borderBottom: i < reviews.length - 1 ? s.reviewItem.borderBottom : "none",
                    paddingBottom: i < reviews.length - 1 ? s.reviewItem.paddingBottom : 0,
                    marginBottom: i < reviews.length - 1 ? s.reviewItem.marginBottom : 0,
                  }}
                >
                  <div style={s.reviewHeader}>
                    <span style={s.reviewerName}>{r.reviewer_name}</span>
                    <span style={s.reviewStars}>{"⭐".repeat(r.rating)}</span>
                  </div>
                  <p style={s.reviewBody}>{r.body}</p>
                  <p style={s.reviewDate}>
                    {new Date(r.created_at).toLocaleDateString("en-PH", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  {r.owner_reply && (
                    <div style={s.replyBox}>
                      <p style={s.replyLabel}>🏪 Owner replied:</p>
                      <p style={s.replyBody}>{r.owner_reply}</p>
                    </div>
                  )}
                  {user?.role === "owner" && !r.owner_reply && (
                    <ReplyForm reviewId={r.id} onReplied={fetchReviews} dark={dark} />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Write a review */}
        {user && user.role !== "owner" && (
          <>
            <div style={s.divider} />
            <section style={s.section}>
              <p style={s.sectionHead}>Write a review</p>
              {reviewSuccess && <div style={s.success}>✅ Review submitted! Salamat!</div>}
              {reviewError && <div style={s.error}>⚠️ {reviewError}</div>}
              <form onSubmit={submitReview}>
                <label style={s.label}>Your rating</label>
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      aria-label={`Rate ${star} out of 5 stars`}
                      aria-pressed={reviewForm.rating === star}
                      style={{
                        fontSize: "32px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: reviewForm.rating >= star ? 1 : 0.2,
                        padding: "0 2px",
                      }}
                    >⭐</button>
                  ))}
                </div>
                <label style={s.label}>Your review</label>
                <textarea
                  style={s.textarea}
                  placeholder="Share your experience with this business..."
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                  rows={4}
                  required
                />
                <button type="submit" style={s.orangeBtn}>Submit review →</button>
              </form>
            </section>
          </>
        )}

        <div style={{ height: isMobile ? "32px" : "48px" }} />
      </main>
    </div>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark, isMobile) {
  const TEXT       = dark ? "#f0e8df" : "#1c1007";
  const SECONDARY  = dark ? "#c8bfb4" : "#5a4a38";
  const MUTED      = dark ? "#8a7a6a" : "#a08878";
  const PAGE_BG    = dark ? "#1a1208" : "#ffffff";
  const DIVIDER    = dark ? "#2d2413" : "#f0ebe3";
  const HEAD_COLOR = dark ? "#6a5a4a" : "#b0a090";
  const INNER_BG   = dark ? "#241a0e" : "#fdf8f3";
  const INPUT_BG   = dark ? "#3d2c1e" : "#fafaf8";
  const INPUT_BORDER = dark ? "#5a4030" : "#e8e0d5";

  return {
    page: { backgroundColor: PAGE_BG, minHeight: "100vh" },
    loadingPage: {
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: "16px", backgroundColor: PAGE_BG,
    },
    loadingText: { fontSize: "18px", color: MUTED },

    // ── Banner ──
    banner: {
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      minHeight: isMobile ? "320px" : "480px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    },
    bannerOverlay: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.78) 100%)",
    },
    backBtn: {
      position: "absolute",
      top: isMobile ? "14px" : "20px",
      left: isMobile ? "14px" : "20px",
      zIndex: 2,
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "white",
      padding: "8px 18px",
      borderRadius: "50px",
      cursor: "pointer",
      fontSize: "14px",
      fontFamily: "Poppins, sans-serif",
      fontWeight: "500",
    },
    glassStrip: {
      position: "relative",
      zIndex: 1,
      padding: isMobile ? "20px 16px 24px" : "28px 36px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "16px",
      flexWrap: isMobile ? "wrap" : "nowrap",
    },
    stripLeft: { display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 },
    catLabel: {
      fontSize: "11px",
      fontWeight: "700",
      color: "rgba(255,255,255,0.7)",
      textTransform: "uppercase",
      letterSpacing: "1.5px",
    },
    bizName: {
      fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(28px, 4vw, 48px)",
      fontWeight: "800",
      color: "white",
      margin: 0,
      lineHeight: 1.1,
      textShadow: "0 2px 16px rgba(0,0,0,0.5)",
    },
    stripMeta: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
    metaChip: { fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: "600" },
    stripActions: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexShrink: 0,
      paddingBottom: "4px",
    },
    iconBtn: {
      width: "46px",
      height: "46px",
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      border: "1.5px solid rgba(255,255,255,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      textDecoration: "none",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    iconBtnSaved: {
      width: "46px",
      height: "46px",
      borderRadius: "50%",
      backgroundColor: "white",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    },

    // ── Content ──
    content: {
      maxWidth: "780px",
      margin: "0 auto",
      padding: isMobile ? "0 16px" : "0 24px",
    },
    section: { padding: isMobile ? "24px 0" : "36px 0" },
    sectionHead: {
      fontSize: "11px",
      fontWeight: "700",
      color: HEAD_COLOR,
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      marginBottom: "16px",
      margin: "0 0 16px 0",
    },
    divider: { height: "1px", backgroundColor: DIVIDER, margin: 0 },

    body: { fontSize: "16px", color: SECONDARY, lineHeight: "1.85", margin: 0 },

    // Details grid
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "20px 32px",
    },
    detailItem: { display: "flex", gap: "14px", alignItems: "flex-start" },
    detailIcon: { fontSize: "20px", flexShrink: 0, marginTop: "2px" },
    detailLabel: {
      fontSize: "11px", fontWeight: "700", color: MUTED,
      textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px",
    },
    detailValue: { fontSize: "15px", color: TEXT, fontWeight: "500", margin: 0 },

    // Announcements
    announcementCard: {
      backgroundColor: INNER_BG,
      borderRadius: "14px",
      padding: "18px 20px",
      border: dark ? "1px solid #3d2c1e" : "1px solid #eddfd0",
    },
    announcementTitle: { fontWeight: "700", fontSize: "15px", color: TEXT, marginBottom: "6px" },
    announcementBody: { fontSize: "14px", color: SECONDARY, lineHeight: "1.6", marginBottom: "8px" },
    announcementDate: { fontSize: "12px", color: MUTED, margin: 0 },

    // Photos
    photoGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: "8px",
    },
    photoThumb: {
      width: "100%",
      aspectRatio: "1",
      objectFit: "cover",
      borderRadius: "10px",
      cursor: "pointer",
      display: "block",
    },

    // Lightbox
    lightbox: {
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "24px",
    },
    lightboxImg: { maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", objectFit: "contain" },
    lightboxClose: {
      position: "absolute", top: "20px", right: "24px",
      background: "rgba(255,255,255,0.15)", border: "none", color: "white",
      fontSize: "20px", cursor: "pointer", borderRadius: "50%",
      width: "44px", height: "44px", display: "flex",
      alignItems: "center", justifyContent: "center",
    },

    // Reviews
    reviewItem: {
      borderBottom: `1px solid ${DIVIDER}`,
      paddingBottom: "24px",
      marginBottom: "24px",
    },
    reviewHeader: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: "8px",
    },
    reviewerName: { fontWeight: "700", fontSize: "15px", color: TEXT },
    reviewStars: { fontSize: "13px" },
    reviewBody: { fontSize: "15px", color: SECONDARY, lineHeight: "1.7", marginBottom: "6px" },
    reviewDate: { fontSize: "12px", color: MUTED, margin: 0 },
    replyBox: {
      marginTop: "14px", backgroundColor: INNER_BG,
      borderRadius: "12px", padding: "14px 18px", borderLeft: `3px solid ${ORANGE}`,
    },
    replyLabel: { fontSize: "12px", fontWeight: "700", color: ORANGE, marginBottom: "4px" },
    replyBody: { fontSize: "14px", color: SECONDARY, lineHeight: "1.6", margin: 0 },

    // Write review
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: SECONDARY, marginBottom: "8px" },
    textarea: {
      display: "block", width: "100%", padding: "14px 16px",
      borderRadius: "14px", border: `1.5px solid ${INPUT_BORDER}`,
      fontSize: "15px", outline: "none", boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif", color: TEXT,
      backgroundColor: INPUT_BG, resize: "vertical", marginBottom: "16px",
    },
    orangeBtn: {
      padding: "13px 32px", backgroundColor: ORANGE, color: "white",
      border: "none", borderRadius: "12px", fontSize: "15px",
      fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    success: {
      backgroundColor: dark ? "#1e3010" : "#eaf3de",
      color: dark ? "#7abf4a" : "#3b6d11",
      padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "16px",
    },
    error: {
      backgroundColor: dark ? "#300a0a" : "#fff0f0",
      color: dark ? "#ff6b6b" : "#cc0000",
      padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "16px",
    },
  };
}

export default BusinessPage;
