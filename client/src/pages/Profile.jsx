import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Profile() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [saved, setSaved] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", currentPassword: "", newPassword: "" });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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

  const openEdit = () => {
    setEditForm({ name: user?.name || "", currentPassword: "", newPassword: "" });
    setEditError("");
    setEditSuccess(false);
    setEditMode(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    try {
      const res = await API.put("/auth/me", editForm);
      const updated = res.data.user;
      localStorage.setItem("user", JSON.stringify({ ...user, name: updated.name }));
      setEditSuccess(true);
      setEditLoading(false);
      setTimeout(() => { setEditMode(false); window.location.reload(); }, 1200);
    } catch (err) {
      setEditError(err.response?.data?.error || "Update failed");
      setEditLoading(false);
    }
  };

  const s = getStyles(dark, isMobile);

  if (loading)
    return (
      <div style={s.loadingPage}>
        <p style={s.loadingText}>Loading profile... 🛖</p>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <h1 style={s.name}>{user?.name}</h1>
          <p style={s.email}>{user?.email}</p>
          <span style={s.roleBadge}>
            {user?.role === "owner" ? "🏪 Business Owner" : "🛍️ Customer"}
          </span>

          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statItem}>
              <span style={s.statNum}>{saved.length}</span>
              <span style={s.statLabel}>Saved</span>
            </div>
            {user?.role !== "owner" && (
              <div style={s.statItem}>
                <span style={s.statNum}>{reviews.length}</span>
                <span style={s.statLabel}>Reviews</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={openEdit} style={s.editBtn}>✏️ Edit Profile</button>
            <button onClick={logout} style={s.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>

      <main style={s.content}>
        {/* Edit profile form */}
        {editMode && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>✏️ Edit Profile</h2>
            {editSuccess && <div style={s.successMsg}>✅ Profile updated!</div>}
            {editError && <div style={s.errorMsg}>⚠️ {editError}</div>}
            <form onSubmit={submitEdit}>
              <label style={s.formLabel}>Name</label>
              <input
                style={s.formInput}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <label style={s.formLabel}>New password <span style={{ fontWeight: 400, opacity: 0.6 }}>(leave blank to keep current)</span></label>
              <input
                style={s.formInput}
                type="password"
                placeholder="••••••••"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
              />
              {editForm.newPassword && (
                <>
                  <label style={s.formLabel}>Current password</label>
                  <input
                    style={s.formInput}
                    type="password"
                    placeholder="••••••••"
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    required
                  />
                </>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" style={editLoading ? s.btnDisabled : s.orangeBtn} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save changes →"}
                </button>
                <button type="button" style={s.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Saved businesses */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>
            ❤️ Saved businesses {saved.length > 0 && `(${saved.length})`}
          </h2>
          {saved.length === 0 ? (
            <div style={s.empty}>
              <p style={{ fontSize: "32px" }}>🤍</p>
              <p>No saved businesses yet!</p>
              <Link to="/" style={s.browseBtn}>Browse businesses →</Link>
            </div>
          ) : (
            <div style={s.grid}>
              {saved.map((b) => (
                <Link to={`/business/${b.id}`} key={b.id} style={s.card}>
                  {b.cover_photo_url ? (
                    <img src={b.cover_photo_url} alt={b.name} style={s.cardPhoto} />
                  ) : (
                    <div style={s.cardPhotoPlaceholder}>🛖</div>
                  )}
                  <div style={s.cardBody}>
                    <div style={s.cardTop}>
                      <h3 style={s.cardTitle}>{b.name}</h3>
                      {b.is_verified && <span style={{ fontSize: "14px" }}>✅</span>}
                    </div>
                    {b.category && <span style={s.categoryBadge}>{b.category}</span>}
                    <p style={s.cardDesc}>
                      {b.description?.length > 80 ? b.description.slice(0, 80) + "…" : b.description}
                    </p>
                    <p style={s.cardAddr}>📍 {b.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews written */}
        {user?.role !== "owner" && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              ✍️ My reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <div style={s.empty}>
                <p style={{ fontSize: "32px" }}>⭐</p>
                <p>You haven't written any reviews yet!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviews.map((r) => (
                  <Link to={`/business/${r.business_id}`} key={r.id} style={s.reviewCard}>
                    <div style={s.reviewHeader}>
                      <span style={s.reviewBusiness}>{r.business_name}</span>
                      <span style={s.reviewStars}>{"⭐".repeat(r.rating)}</span>
                    </div>
                    <p style={s.reviewBody}>{r.body}</p>
                    <p style={s.reviewDate}>
                      {new Date(r.created_at).toLocaleDateString("en-PH", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const ORANGE = "#e8601c";
const DARK = "#2d2413";

function getStyles(dark, isMobile) {
  const DARK_TEXT = dark ? "#f0e8df" : DARK;
  const CARD_BG = dark ? "#2d2413" : "white";
  const CARD_BORDER = dark ? "#4a3828" : "#f0e8df";
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";
  const SECONDARY = dark ? "#c8bfb4" : "#555";
  const MUTED = dark ? "#8a7a6a" : "#aaa";
  const INNER_CARD_BG = dark ? "#241a0e" : "#fdf8f3";

  return {
    page: { backgroundColor: PAGE_BG, minHeight: "100vh" },
    loadingPage: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      backgroundColor: PAGE_BG,
    },
    loadingText: { fontSize: "18px", color: MUTED },
    hero: {
      background: "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      padding: isMobile ? "32px 16px" : "48px 24px",
      color: "white",
      textAlign: "center",
    },
    heroInner: { maxWidth: "500px", margin: "0 auto" },
    avatar: {
      width: isMobile ? "60px" : "72px",
      height: isMobile ? "60px" : "72px",
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? "26px" : "32px",
      fontWeight: "800",
      margin: "0 auto 16px",
      border: "3px solid rgba(255,255,255,0.4)",
    },
    name: {
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: "800",
      marginBottom: "6px",
      color: "white",
    },
    email: { fontSize: "14px", opacity: 0.8, marginBottom: "12px" },
    roleBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
    },
    statsRow: {
      display: "flex",
      justifyContent: "center",
      gap: "32px",
      marginTop: "20px",
    },
    statItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2px",
    },
    statNum: {
      fontSize: "24px",
      fontWeight: "800",
      color: "white",
    },
    statLabel: {
      fontSize: "12px",
      color: "rgba(255,255,255,0.75)",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    editBtn: {
      backgroundColor: "rgba(255,255,255,0.15)",
      border: "1.5px solid rgba(255,255,255,0.6)",
      color: "white",
      padding: "10px 24px",
      borderRadius: "50px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      fontFamily: "Poppins, sans-serif",
    },
    logoutBtn: {
      backgroundColor: "transparent",
      border: "1.5px solid rgba(255,255,255,0.4)",
      color: "rgba(255,255,255,0.8)",
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
      padding: isMobile ? "16px" : "32px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "32px",
    },
    section: {
      backgroundColor: CARD_BG,
      borderRadius: "20px",
      padding: isMobile ? "18px" : "28px",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${CARD_BORDER}`,
    },
    sectionTitle: {
      fontSize: isMobile ? "17px" : "20px",
      fontWeight: "700",
      color: DARK_TEXT,
      marginBottom: "20px",
    },
    empty: {
      textAlign: "center",
      padding: "32px 0",
      color: MUTED,
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
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "16px",
    },
    card: {
      backgroundColor: INNER_CARD_BG,
      borderRadius: "16px",
      textDecoration: "none",
      color: "inherit",
      border: `1px solid ${CARD_BORDER}`,
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      overflow: "hidden",
    },
    cardPhoto: {
      width: isMobile ? "90px" : "100%",
      height: isMobile ? "90px" : "130px",
      objectFit: "cover",
      flexShrink: 0,
    },
    cardPhotoPlaceholder: {
      width: isMobile ? "90px" : "100%",
      height: isMobile ? "90px" : "130px",
      backgroundColor: dark ? "#3d2c1e" : "#f5ede4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? "28px" : "36px",
      flexShrink: 0,
    },
    cardBody: {
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      flex: 1,
      minWidth: 0,
    },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" },
    cardTitle: {
      fontSize: "15px",
      fontWeight: "700",
      color: DARK_TEXT,
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    categoryBadge: {
      display: "inline-block",
      backgroundColor: dark ? "#3d2413" : "#fff3ec",
      color: ORANGE,
      fontSize: "11px",
      fontWeight: "600",
      padding: "2px 10px",
      borderRadius: "20px",
      border: `1px solid ${dark ? "#7a4a2a" : "#fad4bc"}`,
      width: "fit-content",
    },
    cardDesc: {
      fontSize: "13px",
      color: SECONDARY,
      margin: 0,
      lineHeight: "1.4",
    },
    cardAddr: { fontSize: "12px", color: MUTED, margin: 0 },
    reviewCard: {
      backgroundColor: INNER_CARD_BG,
      borderRadius: "14px",
      padding: "18px",
      textDecoration: "none",
      color: "inherit",
      border: `1px solid ${CARD_BORDER}`,
    },
    reviewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
      flexWrap: "wrap",
      gap: "4px",
    },
    reviewBusiness: { fontWeight: "700", fontSize: "15px", color: ORANGE },
    reviewStars: { fontSize: "14px" },
    reviewBody: { fontSize: "14px", color: SECONDARY, lineHeight: "1.6", marginBottom: "6px" },
    reviewDate: { fontSize: "12px", color: MUTED },
    formLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: SECONDARY, marginBottom: "6px", marginTop: "14px" },
    formInput: {
      display: "block", width: "100%", padding: "12px 16px",
      borderRadius: "12px", border: `1.5px solid ${dark ? "#5a4030" : "#e8e0d8"}`,
      fontSize: "15px", outline: "none", boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif", color: DARK_TEXT,
      backgroundColor: dark ? "#3d2c1e" : "#fafaf8",
    },
    orangeBtn: {
      padding: "12px 28px", backgroundColor: ORANGE, color: "white",
      border: "none", borderRadius: "12px", fontSize: "15px",
      fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    btnDisabled: {
      padding: "12px 28px", backgroundColor: "#ccc", color: "white",
      border: "none", borderRadius: "12px", fontSize: "15px",
      fontWeight: "700", cursor: "not-allowed", fontFamily: "Poppins, sans-serif",
    },
    cancelBtn: {
      padding: "12px 28px", backgroundColor: dark ? "#3d2c1e" : "white",
      border: `1.5px solid ${dark ? "#5a4030" : "#e8e0d8"}`, color: SECONDARY,
      borderRadius: "12px", fontSize: "15px", fontWeight: "600",
      cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    successMsg: {
      backgroundColor: dark ? "#1e3010" : "#eaf3de", color: dark ? "#7abf4a" : "#3b6d11",
      padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "12px",
    },
    errorMsg: {
      backgroundColor: dark ? "#300a0a" : "#fff0f0", color: dark ? "#ff6b6b" : "#cc0000",
      padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "12px",
    },
  };
}

export default Profile;
