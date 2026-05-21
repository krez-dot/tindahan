import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  const s = getStyles(dark, isMobile);

  return (
    <div style={s.page}>
      {!isMobile && (
        <div style={s.left}>
          <h1 style={s.leftTitle}>🛖 Tindahan</h1>
          <p style={s.leftSub}>Discover the best local businesses in Tarlac City</p>
          <div style={s.features}>
            <div style={s.feature}>🍚 Find local karinderya & restaurants</div>
            <div style={s.feature}>🛍️ Discover hidden retail gems</div>
            <div style={s.feature}>🔧 Connect with local service providers</div>
            <div style={s.feature}>🌺 Support your community</div>
          </div>
        </div>
      )}

      <div style={s.right}>
        {isMobile && (
          <div style={s.mobileHeader}>
            <span style={s.mobileLogo}>🛖 Tindahan</span>
          </div>
        )}
        <div style={s.card}>
          <h2 style={s.title}>Welcome back! 👋</h2>
          <p style={s.subtitle}>Login to your Tindahan account</p>

          {error && <div style={s.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button style={loading ? s.btnDisabled : s.btn} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p style={s.footer}>
            No account yet?{" "}
            <Link to="/register" style={s.link}>Register for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark, isMobile) {
  const TEXT = dark ? "#f0e8df" : "#2d2413";
  const SECONDARY = dark ? "#c8bfb4" : "#555";
  const MUTED = dark ? "#8a7a6a" : "#888";
  const CARD_BG = dark ? "#2d2413" : "white";
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";
  const INPUT_BG = dark ? "#3d2c1e" : "white";
  const INPUT_BORDER = dark ? "#5a4030" : "#e8e0d8";

  return {
    page: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: isMobile ? "column" : "row",
    },
    left: {
      flex: 1,
      background: "linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%)",
      padding: "60px 48px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      color: "white",
    },
    leftTitle: { fontSize: "36px", fontWeight: "800", marginBottom: "16px", color: "white" },
    leftSub: { fontSize: "18px", opacity: 0.85, marginBottom: "40px", lineHeight: "1.6" },
    features: { display: "flex", flexDirection: "column", gap: "16px" },
    feature: {
      fontSize: "15px",
      backgroundColor: "rgba(255,255,255,0.12)",
      padding: "14px 20px",
      borderRadius: "12px",
      fontWeight: "500",
    },
    right: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: PAGE_BG,
      padding: isMobile ? "24px 16px" : "40px 24px",
    },
    mobileHeader: {
      marginBottom: "24px",
      textAlign: "center",
    },
    mobileLogo: {
      fontSize: "22px",
      fontWeight: "800",
      color: ORANGE,
    },
    card: {
      backgroundColor: CARD_BG,
      padding: isMobile ? "28px 20px" : "48px 40px",
      borderRadius: "24px",
      boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.3)" : "0 8px 40px rgba(0,0,0,0.08)",
      width: "100%",
      maxWidth: "420px",
      border: dark ? "1px solid #4a3828" : "none",
    },
    title: { fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: TEXT, marginBottom: "6px" },
    subtitle: { fontSize: "15px", color: MUTED, marginBottom: "28px" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: SECONDARY, marginBottom: "6px" },
    input: {
      display: "block",
      width: "100%",
      padding: "13px 16px",
      marginBottom: "18px",
      borderRadius: "12px",
      border: `1.5px solid ${INPUT_BORDER}`,
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
      color: TEXT,
      backgroundColor: INPUT_BG,
    },
    btn: {
      width: "100%",
      padding: "14px",
      backgroundColor: ORANGE,
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      marginBottom: "20px",
      fontFamily: "Poppins, sans-serif",
    },
    btnDisabled: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#ccc",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "not-allowed",
      marginBottom: "20px",
      fontFamily: "Poppins, sans-serif",
    },
    error: {
      backgroundColor: dark ? "#300a0a" : "#fff0f0",
      color: dark ? "#ff6b6b" : "#cc0000",
      padding: "12px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      marginBottom: "18px",
    },
    footer: { textAlign: "center", fontSize: "14px", color: MUTED },
    link: { color: ORANGE, fontWeight: "600", textDecoration: "none" },
  };
}

export default Login;
