import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

function AdminPage() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const showToast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejectingId, setRejectingId] = useState(null); // id of business showing reason input
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return navigate("/");
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    API.get("/businesses/admin/verification-requests")
      .then((res) => { setRequests(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleApprove = async (id, name) => {
    setActing(id);
    try {
      await API.put(`/businesses/${id}/verify`);
      showToast(`✅ ${name} is now verified!`);
      fetchRequests();
    } catch {
      showToast("Failed to verify business", "error");
    }
    setActing(null);
  };

  const handleReject = async (id, name) => {
    setActing(id);
    try {
      await API.put(`/businesses/${id}/reject-verification`, { reason: rejectReason });
      showToast(`Rejected verification for ${name}`);
      setRejectingId(null);
      setRejectReason("");
      fetchRequests();
    } catch {
      showToast("Failed to reject", "error");
    }
    setActing(null);
  };

  const s = getStyles(dark);

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>🛡️ Admin Panel</h1>
          <p style={s.heroSub}>Review and approve verification requests</p>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>
            Verification requests
            {requests.length > 0 && (
              <span style={s.badge}>{requests.length}</span>
            )}
          </h2>

          {loading ? (
            <p style={s.muted}>Loading...</p>
          ) : requests.length === 0 ? (
            <div style={s.empty}>
              <p style={{ fontSize: "32px" }}>🎉</p>
              <p>No pending verification requests.</p>
            </div>
          ) : (
            <div style={s.list}>
              {requests.map((b) => (
                <div key={b.id} style={s.requestCard}>
                  <div style={s.requestLeft}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "12px", flexShrink: 0,
                      backgroundImage: b.cover_photo
                        ? `url(${b.cover_photo})`
                        : "linear-gradient(135deg, #3d2c1e 0%, #e8601c 100%)",
                      backgroundSize: "cover", backgroundPosition: "center",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                    }}>
                      {!b.cover_photo && "🛖"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.bizName}>{b.name}</div>
                      <div style={s.bizMeta}>
                        {b.category && <span style={s.catBadge}>{b.category}</span>}
                        <span style={s.bizOwner}>👤 {b.owner_name}</span>
                      </div>
                      <div style={s.bizAddr}>📍 {b.address}</div>
                      <Link to={`/business/${b.id}`} style={s.viewLink} target="_blank">
                        View listing →
                      </Link>
                      {rejectingId === b.id && (
                        <div style={{ marginTop: "10px" }}>
                          <input
                            style={s.reasonInput}
                            placeholder="Reason for rejection (optional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                          />
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button
                              style={acting === b.id ? s.btnDisabled : s.rejectBtn}
                              onClick={() => handleReject(b.id, b.name)}
                              disabled={acting === b.id}
                            >
                              {acting === b.id ? "Rejecting..." : "Confirm reject"}
                            </button>
                            <button
                              style={s.cancelBtn}
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={s.actions}>
                    <button
                      style={acting === b.id ? s.btnDisabled : s.approveBtn}
                      onClick={() => handleApprove(b.id, b.name)}
                      disabled={acting === b.id}
                    >
                      ✅ Approve
                    </button>
                    {rejectingId !== b.id && (
                      <button
                        style={acting === b.id ? s.btnDisabled : s.rejectBtn}
                        onClick={() => { setRejectingId(b.id); setRejectReason(""); }}
                        disabled={acting === b.id}
                      >
                        ✕ Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStyles(dark) {
  const TEXT = dark ? "#f0e8df" : "#2d2413";
  const SECONDARY = dark ? "#c8bfb4" : "#555";
  const MUTED = dark ? "#8a7a6a" : "#aaa";
  const CARD_BG = dark ? "#2d2413" : "white";
  const CARD_BORDER = dark ? "#4a3828" : "#f0e8df";
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";
  const INNER_BG = dark ? "#241a0e" : "#fdf8f3";

  return {
    page: { backgroundColor: PAGE_BG, minHeight: "100vh" },
    hero: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #2d2413 60%, #3d2c1e 100%)",
      padding: "48px 24px",
      color: "white",
    },
    heroInner: { maxWidth: "720px", margin: "0 auto" },
    heroTitle: { fontSize: "32px", fontWeight: "800", marginBottom: "8px", color: "white" },
    heroSub: { fontSize: "16px", opacity: 0.8 },
    content: { maxWidth: "720px", margin: "0 auto", padding: "32px 24px" },
    card: {
      backgroundColor: CARD_BG,
      borderRadius: "20px",
      padding: "28px",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${CARD_BORDER}`,
    },
    cardTitle: {
      fontSize: "18px", fontWeight: "700", color: TEXT, marginBottom: "20px",
      display: "flex", alignItems: "center", gap: "10px",
    },
    badge: {
      backgroundColor: "#e8601c", color: "white",
      borderRadius: "20px", padding: "2px 10px",
      fontSize: "13px", fontWeight: "700",
    },
    empty: { textAlign: "center", padding: "32px 0", color: MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
    muted: { color: MUTED, fontSize: "14px" },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    requestCard: {
      backgroundColor: INNER_BG,
      borderRadius: "14px",
      padding: "18px",
      border: `1px solid ${CARD_BORDER}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
    },
    requestLeft: { display: "flex", gap: "14px", flex: 1, minWidth: 0 },
    bizName: { fontWeight: "700", fontSize: "16px", color: TEXT, marginBottom: "6px" },
    bizMeta: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" },
    catBadge: {
      backgroundColor: dark ? "#3d2413" : "#fff3ec", color: "#e8601c",
      fontSize: "11px", fontWeight: "600", padding: "2px 8px",
      borderRadius: "20px", border: "1px solid #fad4bc",
    },
    bizOwner: { fontSize: "12px", color: SECONDARY },
    bizAddr: { fontSize: "12px", color: MUTED, marginBottom: "6px" },
    viewLink: { fontSize: "12px", color: "#e8601c", fontWeight: "600", textDecoration: "none" },
    reasonInput: {
      width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
      border: dark ? "1.5px solid #5a4030" : "1.5px solid #e8e0d8",
      backgroundColor: dark ? "#3d2c1e" : "#fafaf8", color: TEXT,
      fontFamily: "Poppins, sans-serif", boxSizing: "border-box", outline: "none",
    },
    cancelBtn: {
      padding: "7px 14px", backgroundColor: "transparent", color: SECONDARY,
      border: `1.5px solid ${CARD_BORDER}`, borderRadius: "8px",
      fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    actions: { display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" },
    approveBtn: {
      padding: "8px 18px", backgroundColor: dark ? "#1a3010" : "#eaf3de",
      color: dark ? "#7abf4a" : "#3b6d11",
      border: dark ? "1.5px solid #3b6d11" : "1.5px solid #7abf4a",
      borderRadius: "10px", fontSize: "13px", fontWeight: "700",
      cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    rejectBtn: {
      padding: "8px 18px", backgroundColor: dark ? "#300a0a" : "#fff0f0",
      color: dark ? "#ff6b6b" : "#cc0000",
      border: dark ? "1.5px solid #5a1a1a" : "1.5px solid #ffcccc",
      borderRadius: "10px", fontSize: "13px", fontWeight: "700",
      cursor: "pointer", fontFamily: "Poppins, sans-serif",
    },
    btnDisabled: {
      padding: "8px 18px", backgroundColor: dark ? "#2d2413" : "#f0ebe3",
      color: MUTED, border: `1.5px solid ${CARD_BORDER}`,
      borderRadius: "10px", fontSize: "13px", fontWeight: "700",
      cursor: "not-allowed", fontFamily: "Poppins, sans-serif",
    },
  };
}

export default AdminPage;
