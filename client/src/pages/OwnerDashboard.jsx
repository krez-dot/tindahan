import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", expires_at: "" });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editCategoryIds, setEditCategoryIds] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "owner") return navigate("/");
    fetchBusinesses();
    API.get("/categories").then((res) => setAllCategories(res.data)).catch(() => {});
  }, []);

  const fetchBusinesses = () => {
    API.get("/businesses?limit=100")
      .then((res) => {
        const mine = res.data.businesses.filter((b) => b.owner_id === user.id);
        setBusinesses(mine);
        if (mine.length > 0) {
          setSelectedBusiness(mine[0]);
          fetchAnnouncements(mine[0].id);
          fetchPhotos(mine[0].id);
          fetchAnalytics(mine[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAnnouncements = (businessId) => {
    API.get(`/announcements/${businessId}`).then((res) => setAnnouncements(res.data));
  };

  const fetchPhotos = (businessId) => {
    API.get(`/upload/${businessId}`).then((res) => setPhotos(res.data));
  };

  const fetchAnalytics = (businessId) => {
    API.get(`/businesses/${businessId}/analytics`)
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null));
  };

  const handleSelectBusiness = (b) => {
    setSelectedBusiness(b);
    setEditMode(false);
    setDeleteConfirm(false);
    setAnalytics(null);
    fetchAnnouncements(b.id);
    fetchPhotos(b.id);
    fetchAnalytics(b.id);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoSuccess(false);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      await API.post(`/upload/${selectedBusiness.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchPhotos(selectedBusiness.id);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    } catch {
      setError("Failed to upload photo");
    }
    setUploadingPhoto(false);
    e.target.value = "";
  };

  const handleRequestVerification = async () => {
    setVerifyLoading(true);
    try {
      await API.post(`/businesses/${selectedBusiness.id}/request-verification`);
      fetchBusinesses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request verification");
    }
    setVerifyLoading(false);
  };

  const handleDeletePhoto = async (photoId) => {
    await API.delete(`/upload/${photoId}`);
    fetchPhotos(selectedBusiness.id);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    setPosting(true);
    try {
      await API.post("/announcements", {
        business_id: selectedBusiness.id,
        title: form.title,
        body: form.body,
        expires_at: form.expires_at || null,
      });
      setSuccess(true);
      setForm({ title: "", body: "", expires_at: "" });
      fetchAnnouncements(selectedBusiness.id);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post");
    }
    setPosting(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    await API.delete(`/announcements/${id}`);
    fetchAnnouncements(selectedBusiness.id);
  };

  const startEdit = () => {
    setEditForm({
      name: selectedBusiness.name,
      description: selectedBusiness.description || "",
      address: selectedBusiness.address || "",
      phone: selectedBusiness.phone || "",
      hours: selectedBusiness.hours || "",
    });
    setEditCategoryIds(
      selectedBusiness.category_ids_str
        ? selectedBusiness.category_ids_str.split(",").map(Number)
        : []
    );
    setEditMode(true);
    setDeleteConfirm(false);
    setEditSuccess(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/businesses/${selectedBusiness.id}`, { ...editForm, category_ids: editCategoryIds });
      setEditSuccess(true);
      setEditMode(false);
      fetchBusinesses();
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    }
    setEditLoading(false);
  };

  const handleDeleteBusiness = async () => {
    setDeleting(true);
    try {
      await API.delete(`/businesses/${selectedBusiness.id}`);
      setSelectedBusiness(null);
      setDeleteConfirm(false);
      fetchBusinesses();
    } catch {
      setError("Failed to delete business");
    }
    setDeleting(false);
  };

  const s = getStyles(dark);

  if (loading)
    return (
      <div style={s.loadingPage}>
        <p style={s.loadingText}>Loading dashboard... 🛖</p>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>🏪 Owner Dashboard</h1>
          <p style={s.heroSub}>Manage your listings and post announcements</p>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>My businesses</h2>
          {businesses.length === 0 ? (
            <div style={s.empty}>
              <p>You haven't listed any businesses yet!</p>
              <Link to="/add-business" style={s.addBtn}>+ List a business</Link>
            </div>
          ) : (
            <div style={s.bizList}>
              {businesses.map((b) => (
                <div
                  key={b.id}
                  style={selectedBusiness?.id === b.id ? s.bizCardActive : s.bizCard}
                  onClick={() => handleSelectBusiness(b)}
                  className="card-hover"
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    backgroundImage: b.cover_photo
                      ? `url(${b.cover_photo})`
                      : "linear-gradient(135deg, #3d2c1e 0%, #e8601c 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}>
                    {!b.cover_photo && "🛖"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={s.bizName}>{b.name}</p>
                    <p style={s.bizAddr}>📍 {b.address}</p>
                  </div>
                  {b.is_verified && <span style={s.verifiedBadge}>✅</span>}
                </div>
              ))}
              <Link to="/add-business" style={s.addMoreBtn}>+ Add another business</Link>
            </div>
          )}
        </div>

        {selectedBusiness && (
          <>
            <div style={s.card}>
              <div style={s.bizActionsHeader}>
                <div>
                  <h2 style={s.cardTitle}>{selectedBusiness.name}</h2>
                  <p style={s.hint}>
                    {selectedBusiness.category || "No category"} · {selectedBusiness.address}
                  </p>
                </div>
                <div style={s.actionBtns}>
                  <button style={s.editBtn} onClick={startEdit}>✏️ Edit</button>
                  <button style={s.dangerBtn} onClick={() => { setDeleteConfirm(true); setEditMode(false); }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {editSuccess && <div style={s.success}>✅ Business updated successfully!</div>}

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
                <Link to={`/business/${selectedBusiness.id}`} style={s.viewLink}>
                  👁️ View listing →
                </Link>
                {selectedBusiness.is_verified ? (
                  <span style={s.verifiedStatus}>✅ Verified business</span>
                ) : selectedBusiness.verification_requested ? (
                  <span style={s.pendingStatus}>⏳ Verification pending review</span>
                ) : selectedBusiness.verification_rejection_reason ? (
                  <div style={s.rejectedBox}>
                    <span style={s.rejectedLabel}>❌ Verification rejected</span>
                    <span style={s.rejectedReason}>Reason: {selectedBusiness.verification_rejection_reason}</span>
                  </div>
                ) : (
                  <button
                    style={verifyLoading ? s.btnDisabled : s.verifyBtn}
                    onClick={handleRequestVerification}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? "Requesting..." : "🏅 Request verification"}
                  </button>
                )}
              </div>

              {editMode && (
                <form onSubmit={handleEditSubmit} style={s.editForm}>
                  <h3 style={s.editTitle}>✏️ Edit business info</h3>
                  <label style={s.label}>Business name *</label>
                  <input
                    style={s.input}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <label style={s.label}>Description</label>
                  <textarea
                    style={s.textarea}
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <label style={s.label}>Address</label>
                  <input
                    style={s.input}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                  <label style={s.label}>Phone</label>
                  <input
                    style={s.input}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                  <label style={s.label}>Business hours</label>
                  <input
                    style={s.input}
                    placeholder="e.g. Mon–Sat: 8am–6pm, Sun: Closed"
                    value={editForm.hours}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                  />
                  <label style={s.label}>Categories</label>
                  <div style={s.catGrid}>
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        style={editCategoryIds.includes(cat.id) ? s.catBtnActive : s.catBtn}
                        onClick={() => setEditCategoryIds((prev) =>
                          prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div style={s.editActions}>
                    <button type="button" style={s.cancelEditBtn} onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                    <button type="submit" style={editLoading ? s.btnDisabled : s.btn} disabled={editLoading}>
                      {editLoading ? "Saving..." : "💾 Save changes"}
                    </button>
                  </div>
                </form>
              )}

              {deleteConfirm && (
                <div style={s.deleteConfirmBox}>
                  <p style={s.deleteConfirmText}>
                    ⚠️ Are you sure you want to delete <strong>{selectedBusiness.name}</strong>? This cannot be undone!
                  </p>
                  <div style={s.editActions}>
                    <button style={s.cancelEditBtn} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                    <button style={s.confirmDeleteBtn} onClick={handleDeleteBusiness} disabled={deleting}>
                      {deleting ? "Deleting..." : "🗑️ Yes, delete it"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {analytics && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>📊 Analytics</h2>
                <p style={s.hint}>Stats for {selectedBusiness.name}</p>
                <div style={s.statsGrid}>
                  {[
                    { label: "Total views", value: analytics.view_count ?? 0, icon: "👁️" },
                    { label: "Times saved", value: analytics.save_count ?? 0, icon: "❤️" },
                    { label: "Reviews", value: analytics.review_count ?? 0, icon: "⭐" },
                    { label: "Avg rating", value: analytics.avg_rating ? `${analytics.avg_rating} / 5` : "—", icon: "🏆" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={s.statBox}>
                      <span style={s.statIcon}>{icon}</span>
                      <span style={s.statValue}>{value}</span>
                      <span style={s.statLabel}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={s.card}>
              <h2 style={s.cardTitle}>📸 Photos</h2>
              <p style={s.hint}>First photo is used as the cover on your listing.</p>
              {photoSuccess && <div style={s.success}>✅ Photo uploaded!</div>}
              <label style={{
                display: "block", marginTop: "12px", padding: "12px 16px",
                borderRadius: "12px", border: `1.5px dashed ${dark ? "#5a4030" : "#e8e0d8"}`,
                backgroundColor: dark ? "#3d2c1e" : "#fafaf8",
                cursor: "pointer", fontSize: "14px",
                color: uploadingPhoto ? (dark ? "#8a7a6a" : "#aaa") : (dark ? "#c8bfb4" : "#555"),
                textAlign: "center",
              }}>
                {uploadingPhoto ? "Uploading..." : "📁 Click to upload a photo"}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={uploadingPhoto} />
              </label>
              {photos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", marginTop: "16px" }}>
                  {photos.map((p, i) => (
                    <div key={p.id} style={{ position: "relative" }}>
                      <img src={p.url} alt={`photo ${i + 1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", display: "block" }} />
                      {i === 0 && <span style={{ position: "absolute", top: "4px", left: "4px", backgroundColor: ORANGE, color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "6px" }}>Cover</span>}
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-label="Delete photo"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>📢 Post an announcement</h2>
              <p style={s.hint}>For: <strong>{selectedBusiness.name}</strong></p>

              {success && <div style={s.success}>✅ Announcement posted!</div>}
              {error && <div style={s.error}>⚠️ {error}</div>}

              <form onSubmit={handlePost}>
                <label style={s.label}>Title *</label>
                <input
                  style={s.input}
                  placeholder="e.g. 🎉 Grand opening sale this Saturday!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <label style={s.label}>Details</label>
                <textarea
                  style={s.textarea}
                  placeholder="Add more details about your announcement..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={3}
                />
                <label style={s.label}>Expires on (optional)</label>
                <input
                  style={s.input}
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
                <button type="submit" style={posting ? s.btnDisabled : s.btn} disabled={posting}>
                  {posting ? "Posting..." : "📢 Post announcement"}
                </button>
              </form>
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>
                Active announcements {announcements.length > 0 && `(${announcements.length})`}
              </h2>
              {announcements.length === 0 ? (
                <p style={{ color: dark ? "#8a7a6a" : "#aaa", fontSize: "14px" }}>
                  No active announcements yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {announcements.map((a) => (
                    <div key={a.id} style={s.announcementCard} className="card-hover">
                      <div style={s.announcementHeader}>
                        <span style={s.announcementTitle}>{a.title}</span>
                        <button onClick={() => handleDeleteAnnouncement(a.id)} style={s.deleteBtn}>✕</button>
                      </div>
                      {a.body && <p style={s.announcementBody}>{a.body}</p>}
                      <div style={s.announcementFooter}>
                        <span style={s.announcementDate}>
                          Posted {new Date(a.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                        {a.expires_at && (
                          <span style={s.expiresTag}>
                            Expires {new Date(a.expires_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
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
  const INPUT_BG = dark ? "#3d2c1e" : "#fdfaf7";
  const INPUT_BORDER = dark ? "#5a4030" : "#e8e0d8";
  const INNER_BG = dark ? "#241a0e" : "#fdf8f3";

  return {
    page: { backgroundColor: PAGE_BG, minHeight: "100vh" },
    loadingPage: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", backgroundColor: PAGE_BG },
    loadingText: { fontSize: "18px", color: MUTED },
    hero: {
      background: "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      padding: "48px 24px",
      color: "white",
    },
    heroInner: { maxWidth: "720px", margin: "0 auto" },
    heroTitle: { fontSize: "32px", fontWeight: "800", marginBottom: "8px", color: "white" },
    heroSub: { fontSize: "16px", opacity: 0.85 },
    content: { maxWidth: "720px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" },
    card: {
      backgroundColor: CARD_BG,
      borderRadius: "20px",
      padding: "28px",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${CARD_BORDER}`,
    },
    cardTitle: { fontSize: "18px", fontWeight: "700", color: TEXT, marginBottom: "4px" },
    empty: { textAlign: "center", padding: "24px 0", color: MUTED, display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" },
    addBtn: { backgroundColor: ORANGE, color: "white", padding: "10px 24px", borderRadius: "50px", textDecoration: "none", fontWeight: "700", fontSize: "14px" },
    bizList: { display: "flex", flexDirection: "column", gap: "10px" },
    bizCard: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${CARD_BORDER}`,
      cursor: "pointer",
      backgroundColor: INNER_BG,
    },
    bizCardActive: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${ORANGE}`,
      cursor: "pointer",
      backgroundColor: dark ? "#3d1a00" : "#fff3ec",
    },
    bizEmoji: { fontSize: "24px" },
    bizName: { fontWeight: "700", fontSize: "15px", color: TEXT, marginBottom: "2px" },
    bizAddr: { fontSize: "13px", color: MUTED },
    verifiedBadge: { fontSize: "16px" },
    addMoreBtn: { color: ORANGE, fontWeight: "600", fontSize: "14px", textDecoration: "none", textAlign: "center", padding: "10px" },
    bizActionsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "12px", flexWrap: "wrap" },
    actionBtns: { display: "flex", gap: "8px", flexShrink: 0 },
    editBtn: {
      padding: "8px 16px",
      backgroundColor: dark ? "#1e2d3d" : "#f0f7ff",
      color: "#3b82f6",
      border: "1.5px solid #3b82f6",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    dangerBtn: {
      padding: "8px 16px",
      backgroundColor: dark ? "#300a0a" : "#fff0f0",
      color: dark ? "#ff6b6b" : "#cc0000",
      border: dark ? "1.5px solid #5a1a1a" : "1.5px solid #ffcccc",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    viewLink: { display: "inline-block", fontSize: "13px", color: ORANGE, fontWeight: "600", textDecoration: "none" },
    verifyBtn: {
      padding: "6px 14px", backgroundColor: dark ? "#1a2d1a" : "#eaf3de",
      color: dark ? "#7abf4a" : "#3b6d11", border: dark ? "1.5px solid #3b6d11" : "1.5px solid #7abf4a",
      borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    verifiedStatus: { fontSize: "12px", color: dark ? "#7abf4a" : "#3b6d11", fontWeight: "700" },
    pendingStatus: { fontSize: "12px", color: dark ? "#c8a84a" : "#856a00", fontWeight: "600" },
    rejectedBox: { display: "flex", flexDirection: "column", gap: "2px" },
    rejectedLabel: { fontSize: "12px", color: dark ? "#ff6b6b" : "#cc0000", fontWeight: "700" },
    rejectedReason: { fontSize: "12px", color: dark ? "#8a7a6a" : "#888", fontStyle: "italic" },
    editForm: { marginTop: "20px", padding: "20px", backgroundColor: INNER_BG, borderRadius: "14px", border: `1px solid ${CARD_BORDER}` },
    editTitle: { fontSize: "15px", fontWeight: "700", color: TEXT, marginBottom: "12px" },
    editActions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" },
    catGrid: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" },
    catBtn: {
      padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
      border: `1.5px solid ${INPUT_BORDER}`, backgroundColor: INPUT_BG,
      color: SECONDARY, cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    catBtnActive: {
      padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700",
      border: "1.5px solid #e8601c", backgroundColor: dark ? "#3d1a00" : "#fff3ec",
      color: "#e8601c", cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    cancelEditBtn: {
      padding: "10px 20px",
      backgroundColor: INPUT_BG,
      color: SECONDARY,
      border: `1.5px solid ${INPUT_BORDER}`,
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
    deleteConfirmBox: {
      marginTop: "16px",
      padding: "16px",
      backgroundColor: dark ? "#300a0a" : "#fff0f0",
      borderRadius: "12px",
      border: dark ? "1px solid #5a1a1a" : "1px solid #ffcccc",
    },
    deleteConfirmText: { fontSize: "14px", color: dark ? "#ff6b6b" : "#cc0000", marginBottom: "12px", lineHeight: "1.6" },
    confirmDeleteBtn: { padding: "10px 20px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif" },
    hint: { fontSize: "13px", color: MUTED, marginBottom: "16px" },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "12px",
      marginTop: "4px",
    },
    statBox: {
      backgroundColor: dark ? "#1a1208" : "#fdf8f3",
      borderRadius: "14px",
      padding: "18px 16px",
      border: `1px solid ${CARD_BORDER}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      textAlign: "center",
    },
    statIcon: { fontSize: "22px" },
    statValue: { fontSize: "22px", fontWeight: "800", color: TEXT },
    statLabel: { fontSize: "11px", fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: SECONDARY, marginBottom: "6px", marginTop: "14px" },
    input: {
      display: "block",
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${INPUT_BORDER}`,
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
      color: TEXT,
      backgroundColor: INPUT_BG,
    },
    textarea: {
      display: "block",
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${INPUT_BORDER}`,
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
      color: TEXT,
      backgroundColor: INPUT_BG,
      resize: "vertical",
    },
    btn: { marginTop: "16px", padding: "13px 28px", backgroundColor: ORANGE, color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif" },
    btnDisabled: { marginTop: "16px", padding: "13px 28px", backgroundColor: "#ccc", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "not-allowed", fontFamily: "Poppins, sans-serif" },
    success: { backgroundColor: dark ? "#1e3010" : "#eaf3de", color: dark ? "#7abf4a" : "#3b6d11", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "12px" },
    error: { backgroundColor: dark ? "#300a0a" : "#fff0f0", color: dark ? "#ff6b6b" : "#cc0000", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "12px" },
    announcementCard: { backgroundColor: INNER_BG, borderRadius: "12px", padding: "16px", border: `1px solid ${CARD_BORDER}`, borderLeft: "3px solid #e8601c" },
    announcementHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
    announcementTitle: { fontWeight: "700", fontSize: "15px", color: TEXT, flex: 1 },
    deleteBtn: { background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "16px", padding: "0 4px" },
    announcementBody: { fontSize: "14px", color: SECONDARY, lineHeight: "1.6", marginBottom: "8px" },
    announcementFooter: { display: "flex", gap: "12px", alignItems: "center" },
    announcementDate: { fontSize: "12px", color: MUTED },
    expiresTag: { fontSize: "12px", backgroundColor: dark ? "#3d1a00" : "#fff3ec", color: ORANGE, padding: "2px 10px", borderRadius: "20px", fontWeight: "600" },
  };
}

export default OwnerDashboard;
