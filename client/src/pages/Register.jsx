import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1 style={styles.leftTitle}>🛖 Join Tindahan</h1>
        <p style={styles.leftSub}>Be part of Tarlac City's growing local business community</p>
        <div style={styles.roles}>
          <div style={styles.roleCard}>
            <span style={styles.roleEmoji}>🛍️</span>
            <div>
              <p style={styles.roleTitle}>As a Customer</p>
              <p style={styles.roleDesc}>Discover and review local businesses near you</p>
            </div>
          </div>
          <div style={styles.roleCard}>
            <span style={styles.roleEmoji}>🏪</span>
            <div>
              <p style={styles.roleTitle}>As a Business Owner</p>
              <p style={styles.roleDesc}>List your business and reach more customers</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create your account ✨</h2>
          <p style={styles.subtitle}>It's free and takes less than a minute</p>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Full name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Juan dela Cruz"
              value={form.name}
              onChange={handleChange}
              required
            />
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            <label style={styles.label}>I am a...</label>
            <div style={styles.roleToggle}>
              <button
                type="button"
                style={form.role === "customer" ? styles.roleActive : styles.roleBtn}
                onClick={() => setForm({ ...form, role: "customer" })}
              >
                🛍️ Customer
              </button>
              <button
                type="button"
                style={form.role === "owner" ? styles.roleActive : styles.roleBtn}
                onClick={() => setForm({ ...form, role: "owner" })}
              >
                🏪 Business Owner
              </button>
            </div>

            <button style={loading ? styles.btnDisabled : styles.btn} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";

const styles = {
  page: { display: "flex", minHeight: "100vh" },
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
  roles: { display: "flex", flexDirection: "column", gap: "16px" },
  roleCard: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: "18px 20px",
    borderRadius: "14px",
  },
  roleEmoji: { fontSize: "28px" },
  roleTitle: { fontWeight: "700", fontSize: "15px", marginBottom: "4px" },
  roleDesc: { fontSize: "13px", opacity: 0.8 },
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fdf8f3",
    padding: "40px 24px",
  },
  card: {
    backgroundColor: "white",
    padding: "48px 40px",
    borderRadius: "24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
  },
  title: { fontSize: "26px", fontWeight: "800", color: "#2d2413", marginBottom: "6px" },
  subtitle: { fontSize: "15px", color: "#888", marginBottom: "28px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "6px" },
  input: {
    display: "block",
    width: "100%",
    padding: "13px 16px",
    marginBottom: "18px",
    borderRadius: "12px",
    border: "1.5px solid #e8e0d8",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Poppins, sans-serif",
    color: "#2d2413",
  },
  roleToggle: { display: "flex", gap: "10px", marginBottom: "20px" },
  roleBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1.5px solid #e8e0d8",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "Poppins, sans-serif",
    color: "#555",
  },
  roleActive: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: `1.5px solid ${ORANGE}`,
    backgroundColor: "#fff3ec",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "Poppins, sans-serif",
    color: ORANGE,
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
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "18px",
  },
  footer: { textAlign: "center", fontSize: "14px", color: "#888" },
  link: { color: ORANGE, fontWeight: "600", textDecoration: "none" },
};

export default Register;
