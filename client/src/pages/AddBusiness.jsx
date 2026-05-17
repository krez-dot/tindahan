import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function AddBusiness() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    lat: "",
    lng: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/businesses", {
        ...form,
        lat: parseFloat(form.lat) || null,
        lng: parseFloat(form.lng) || null,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create listing");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.title}>🏪 List your business</h1>
          <p style={styles.subtitle}>Fill in your business details and reach more customers in Tarlac!</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic info</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Business name *</label>
                <input
                  style={styles.input}
                  name="name"
                  placeholder="e.g. Aling Nena's Karinderya"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Phone number</label>
                <input
                  style={styles.input}
                  name="phone"
                  placeholder="e.g. 09171234567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label style={styles.label}>Description *</label>
            <textarea
              style={styles.textarea}
              name="description"
              placeholder="Tell customers what your business is about..."
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Location</h3>
            <label style={styles.label}>Street address *</label>
            <input
              style={styles.input}
              name="address"
              placeholder="e.g. 123 Romulo Blvd, Tarlac City"
              value={form.address}
              onChange={handleChange}
              required
            />
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Latitude</label>
                <input
                  style={styles.input}
                  name="lat"
                  placeholder="e.g. 15.4755"
                  value={form.lat}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={styles.label}>Longitude</label>
                <input
                  style={styles.input}
                  name="lng"
                  placeholder="e.g. 120.5960"
                  onChange={handleChange}
                  value={form.lng}
                />
              </div>
            </div>
            <p style={styles.hint}>
              💡 To get coordinates: go to <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={styles.hintLink}>Google Maps</a>, right-click your location, and copy the numbers!
            </p>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate("/")}>
              Cancel
            </button>
            <button type="submit" style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
              {loading ? "Listing business..." : "🛖 List my business →"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";

const styles = {
  page: { backgroundColor: "#fdf8f3", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "720px", margin: "0 auto" },
  header: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#2d2413", marginBottom: "8px" },
  subtitle: { fontSize: "15px", color: "#888" },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  section: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0e8df",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#2d2413", marginBottom: "16px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "4px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "6px", marginTop: "12px" },
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
    color: "#2d2413",
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
    color: "#2d2413",
    backgroundColor: "#fdfaf7",
    resize: "vertical",
  },
  hint: { fontSize: "13px", color: "#aaa", marginTop: "8px" },
  hintLink: { color: ORANGE, textDecoration: "none", fontWeight: "600" },
  error: {
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    padding: "14px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: {
    padding: "13px 28px",
    borderRadius: "12px",
    border: "1.5px solid #e8e0d8",
    backgroundColor: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
    color: "#555",
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
  btnDisabled: {
    padding: "13px 32px",
    backgroundColor: "#ccc",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "not-allowed",
    fontFamily: "Poppins, sans-serif",
  },
};

export default AddBusiness;
