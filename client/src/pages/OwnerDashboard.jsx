import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", expires_at: "" });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Edit business state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Delete business state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "owner") return navigate("/");
    fetchBusinesses();
  }, []);

  const fetchBusinesses = () => {
    API.get("/businesses")
      .then((res) => {
        const mine = res.data.filter((b) => b.owner_id === user.id);
        setBusinesses(mine);
        if (mine.length > 0) {
          setSelectedBusiness(mine[0]);
          fetchAnnouncements(mine[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAnnouncements = (businessId) => {
    API.get(`/announcements/${businessId}`).then((res) =>
      setAnnouncements(res.data),
    );
  };

  const handleSelectBusiness = (b) => {
    setSelectedBusiness(b);
    setEditMode(false);
    setDeleteConfirm(false);
    fetchAnnouncements(b.id);
  };

  // ── Announcement handlers ──────────────────────────────────
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

  // ── Edit business handlers ─────────────────────────────────
  const startEdit = () => {
    setEditForm({
      name: selectedBusiness.name,
      description: selectedBusiness.description || "",
      address: selectedBusiness.address || "",
      phone: selectedBusiness.phone || "",
    });
    setEditMode(true);
    setDeleteConfirm(false);
    setEditSuccess(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/businesses/${selectedBusiness.id}`, editForm);
      setEditSuccess(true);
      setEditMode(false);
      fetchBusinesses();
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    }
    setEditLoading(false);
  };

  // ── Delete business handler ────────────────────────────────
  const handleDeleteBusiness = async () => {
    setDeleting(true);
    try {
      await API.delete(`/businesses/${selectedBusiness.id}`);
      setSelectedBusiness(null);
      setDeleteConfirm(false);
      fetchBusinesses();
    } catch (err) {
      setError("Failed to delete business");
    }
    setDeleting(false);
  };

  if (loading)
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading dashboard... 🛖</p>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>🏪 Owner Dashboard</h1>
          <p style={styles.heroSub}>
            Manage your listings and post announcements
          </p>
        </div>
      </div>

      <div style={styles.content}>
        {/* My businesses */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My businesses</h2>
          {businesses.length === 0 ? (
            <div style={styles.empty}>
              <p>You haven't listed any businesses yet!</p>
              <Link to="/add-business" style={styles.addBtn}>
                + List a business
              </Link>
            </div>
          ) : (
            <div style={styles.bizList}>
              {businesses.map((b) => (
                <div
                  key={b.id}
                  style={
                    selectedBusiness?.id === b.id
                      ? styles.bizCardActive
                      : styles.bizCard
                  }
                  onClick={() => handleSelectBusiness(b)}
                >
                  <span style={styles.bizEmoji}>🛖</span>
                  <div style={{ flex: 1 }}>
                    <p style={styles.bizName}>{b.name}</p>
                    <p style={styles.bizAddr}>📍 {b.address}</p>
                  </div>
                  {b.is_verified && (
                    <span style={styles.verifiedBadge}>✅</span>
                  )}
                </div>
              ))}
              <Link to="/add-business" style={styles.addMoreBtn}>
                + Add another business
              </Link>
            </div>
          )}
        </div>

        {selectedBusiness && (
          <>
            {/* Business actions */}
            <div style={styles.card}>
              <div style={styles.bizActionsHeader}>
                <div>
                  <h2 style={styles.cardTitle}>{selectedBusiness.name}</h2>
                  <p style={styles.hint}>
                    {selectedBusiness.category || "No category"} ·{" "}
                    {selectedBusiness.address}
                  </p>
                </div>
                <div style={styles.actionBtns}>
                  <button style={styles.editBtn} onClick={startEdit}>
                    ✏️ Edit
                  </button>
                  <button
                    style={styles.dangerBtn}
                    onClick={() => {
                      setDeleteConfirm(true);
                      setEditMode(false);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {editSuccess && (
                <div style={styles.success}>
                  ✅ Business updated successfully!
                </div>
              )}

              {/* View on site link */}
              <Link
                to={`/business/${selectedBusiness.id}`}
                style={styles.viewLink}
              >
                👁️ View listing →
              </Link>

              {/* Edit form */}
              {editMode && (
                <form onSubmit={handleEditSubmit} style={styles.editForm}>
                  <h3 style={styles.editTitle}>✏️ Edit business info</h3>
                  <label style={styles.label}>Business name *</label>
                  <input
                    style={styles.input}
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />

                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />

                  <label style={styles.label}>Address</label>
                  <input
                    style={styles.input}
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                  />

                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />

                  <div style={styles.editActions}>
                    <button
                      type="button"
                      style={styles.cancelEditBtn}
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={editLoading ? styles.btnDisabled : styles.btn}
                      disabled={editLoading}
                    >
                      {editLoading ? "Saving..." : "💾 Save changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* Delete confirm */}
              {deleteConfirm && (
                <div style={styles.deleteConfirmBox}>
                  <p style={styles.deleteConfirmText}>
                    ⚠️ Are you sure you want to delete{" "}
                    <strong>{selectedBusiness.name}</strong>? This cannot be
                    undone!
                  </p>
                  <div style={styles.editActions}>
                    <button
                      style={styles.cancelEditBtn}
                      onClick={() => setDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.confirmDeleteBtn}
                      onClick={handleDeleteBusiness}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "🗑️ Yes, delete it"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post announcement */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📢 Post an announcement</h2>
              <p style={styles.hint}>
                For: <strong>{selectedBusiness.name}</strong>
              </p>

              {success && (
                <div style={styles.success}>✅ Announcement posted!</div>
              )}
              {error && <div style={styles.error}>⚠️ {error}</div>}

              <form onSubmit={handlePost}>
                <label style={styles.label}>Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. 🎉 Grand opening sale this Saturday!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <label style={styles.label}>Details</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Add more details about your announcement..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={3}
                />
                <label style={styles.label}>Expires on (optional)</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) =>
                    setForm({ ...form, expires_at: e.target.value })
                  }
                />
                <button
                  type="submit"
                  style={posting ? styles.btnDisabled : styles.btn}
                  disabled={posting}
                >
                  {posting ? "Posting..." : "📢 Post announcement"}
                </button>
              </form>
            </div>

            {/* Active announcements */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                Active announcements{" "}
                {announcements.length > 0 && `(${announcements.length})`}
              </h2>
              {announcements.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "14px" }}>
                  No active announcements yet.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {announcements.map((a) => (
                    <div key={a.id} style={styles.announcementCard}>
                      <div style={styles.announcementHeader}>
                        <span style={styles.announcementTitle}>{a.title}</span>
                        <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          style={styles.deleteBtn}
                        >
                          ✕
                        </button>
                      </div>
                      {a.body && (
                        <p style={styles.announcementBody}>{a.body}</p>
                      )}
                      <div style={styles.announcementFooter}>
                        <span style={styles.announcementDate}>
                          Posted{" "}
                          {new Date(a.created_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {a.expires_at && (
                          <span style={styles.expiresTag}>
                            Expires{" "}
                            {new Date(a.expires_at).toLocaleDateString(
                              "en-PH",
                              { month: "short", day: "numeric" },
                            )}
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
  },
  heroInner: { maxWidth: "720px", margin: "0 auto" },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "8px",
    color: "white",
  },
  heroSub: { fontSize: "16px", opacity: 0.85 },
  content: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
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
    marginBottom: "4px",
  },
  empty: {
    textAlign: "center",
    padding: "24px 0",
    color: "#888",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: ORANGE,
    color: "white",
    padding: "10px 24px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
  },
  bizList: { display: "flex", flexDirection: "column", gap: "10px" },
  bizCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1.5px solid #f0e8df",
    cursor: "pointer",
    backgroundColor: "#fdf8f3",
  },
  bizCardActive: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `1.5px solid ${ORANGE}`,
    cursor: "pointer",
    backgroundColor: "#fff3ec",
  },
  bizEmoji: { fontSize: "24px" },
  bizName: {
    fontWeight: "700",
    fontSize: "15px",
    color: DARK,
    marginBottom: "2px",
  },
  bizAddr: { fontSize: "13px", color: "#aaa" },
  verifiedBadge: { fontSize: "16px" },
  addMoreBtn: {
    color: ORANGE,
    fontWeight: "600",
    fontSize: "14px",
    textDecoration: "none",
    textAlign: "center",
    padding: "10px",
  },

  // Business actions
  bizActionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionBtns: { display: "flex", gap: "8px", flexShrink: 0 },
  editBtn: {
    padding: "8px 16px",
    backgroundColor: "#f0f7ff",
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
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    border: "1.5px solid #ffcccc",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  },
  viewLink: {
    display: "inline-block",
    fontSize: "13px",
    color: ORANGE,
    fontWeight: "600",
    textDecoration: "none",
    marginBottom: "4px",
  },

  // Edit form
  editForm: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#fdf8f3",
    borderRadius: "14px",
    border: "1px solid #f0e8df",
  },
  editTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: DARK,
    marginBottom: "12px",
  },
  editActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "16px",
  },
  cancelEditBtn: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#555",
    border: "1.5px solid #e8e0d8",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  },

  // Delete confirm
  deleteConfirmBox: {
    marginTop: "16px",
    padding: "16px",
    backgroundColor: "#fff0f0",
    borderRadius: "12px",
    border: "1px solid #ffcccc",
  },
  deleteConfirmText: {
    fontSize: "14px",
    color: "#cc0000",
    marginBottom: "12px",
    lineHeight: "1.6",
  },
  confirmDeleteBtn: {
    padding: "10px 20px",
    backgroundColor: "#cc0000",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  },

  hint: { fontSize: "13px", color: "#aaa", marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
    marginTop: "14px",
  },
  input: {
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
  },
  btn: {
    marginTop: "16px",
    padding: "13px 28px",
    backgroundColor: ORANGE,
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  },
  btnDisabled: {
    marginTop: "16px",
    padding: "13px 28px",
    backgroundColor: "#ccc",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "not-allowed",
    fontFamily: "Poppins, sans-serif",
  },
  success: {
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "12px",
  },
  error: {
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "12px",
  },
  announcementCard: {
    backgroundColor: "#fdf8f3",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #f0e8df",
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  announcementTitle: {
    fontWeight: "700",
    fontSize: "15px",
    color: DARK,
    flex: 1,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 4px",
  },
  announcementBody: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  announcementFooter: { display: "flex", gap: "12px", alignItems: "center" },
  announcementDate: { fontSize: "12px", color: "#aaa" },
  expiresTag: {
    fontSize: "12px",
    backgroundColor: "#fff3ec",
    color: ORANGE,
    padding: "2px 10px",
    borderRadius: "20px",
    fontWeight: "600",
  },
};

export default OwnerDashboard;
