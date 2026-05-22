import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BARANGAYS = [
  "Aguso", "Alvindia Segundo", "Amucao", "Armenia", "Asturias", "Atioc",
  "Balanti", "Balete", "Balibago I", "Balibago II", "Balingcanaway", "Banaoang",
  "Bañad", "Baras-Baras", "Batang-Batang", "Binauganan", "Bora", "Budoc",
  "Caarosipan", "Calantipe", "Calingcuan", "Calmay", "Capaoayan", "Carino",
  "Care", "Central", "Culipat", "Cut-cut I", "Cut-cut II", "Dalayap",
  "Dela Paz", "Dolores", "Dela Cruz", "Estrada", "F. Burg", "Gabon", "Galot",
  "Gubat", "Laoang", "Ligtasan", "Lourdes", "Mabilog", "Maliwalo", "Manupeg",
  "Marawi", "Matatalaib", "Matayumcab", "Monte Alegre", "Motrico", "Muñoz",
  "Nagserialan", "Pamaldan", "Panampunan", "Paraiso", "Poblacion", "Puting Kahoy",
  "Ramos", "Salapungan", "San Carlos", "San Francisco", "San Isidro", "San Jose",
  "San Juan de Mata", "San Luis", "San Manuel", "San Miguel", "San Rafael",
  "San Roque", "San Sebastian", "San Vicente", "Sanlanding", "Santo Cristo",
  "Santo Domingo", "Santos-Cabarangcalan", "Sapang Maragul", "Sapang Tagalog",
  "Sepung Calzada", "Sinait", "Suaverdez", "Tibag", "Tibagon", "Tinang",
  "Virgen delos Remedios", "Wakas",
];

const CATEGORY_ICONS = {
  Food: "🍚",
  Retail: "🛍️",
  Services: "🔧",
  Health: "💊",
  Education: "📚",
  Others: "✨",
};

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function AddBusiness() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [form, setForm] = useState({
    name: "", description: "", address: "", barangay: "",
    lat: "", lng: "", phone: "", hours: "",
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [markerPos, setMarkerPos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = (lat, lng) => {
    setMarkerPos({ lat, lng });
    setForm((prev) => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
  };

  const handlePhotos = (e) => setPhotos(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fullAddress = form.barangay
        ? `${form.address}, ${form.barangay}, Tarlac City`
        : form.address;

      const res = await API.post("/businesses", {
        ...form,
        address: fullAddress,
        lat: parseFloat(form.lat) || null,
        lng: parseFloat(form.lng) || null,
        category_ids: selectedCategoryIds,
      });

      for (const photo of photos) {
        const formData = new FormData();
        formData.append("photo", photo);
        await API.post(`/upload/${res.data.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create listing");
      setLoading(false);
    }
  };

  const s = getStyles(dark, isMobile);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>🏪 List your business</h1>
          <p style={s.subtitle}>Fill in your business details and reach more customers in Tarlac!</p>
        </div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Basic info */}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Basic info</h3>
            <div style={s.grid2}>
              <div>
                <label style={s.label}>Business name *</label>
                <input
                  style={s.input}
                  name="name"
                  placeholder="e.g. Aling Nena's Karinderya"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={s.label}>Phone number</label>
                <input
                  style={s.input}
                  name="phone"
                  placeholder="e.g. 09171234567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <label style={s.label}>Business hours</label>
                <input
                  style={s.input}
                  name="hours"
                  placeholder="e.g. Mon–Sat: 8am–6pm, Sun: Closed"
                  value={form.hours}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label style={s.label}>Description *</label>
            <textarea
              style={s.textarea}
              name="description"
              placeholder="Tell customers what your business is about..."
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
            />

            <label style={s.label}>Categories *</label>
            <div style={s.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  style={selectedCategoryIds.includes(cat.id) ? s.catBtnActive : s.catBtn}
                  onClick={() => setSelectedCategoryIds((prev) =>
                    prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                  )}
                >
                  <span style={{ fontSize: "22px" }}>{CATEGORY_ICONS[cat.name] || "🏪"}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{cat.name}</span>
                </button>
              ))}
            </div>
            <p style={s.hint}>
              {selectedCategoryIds.length === 0
                ? "👆 Pick one or more categories that fit your business"
                : `✅ ${selectedCategoryIds.length} categor${selectedCategoryIds.length > 1 ? "ies" : "y"} selected`}
            </p>
          </div>

          {/* Location */}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>📍 Location</h3>

            <label style={s.label}>Street address *</label>
            <input
              style={s.input}
              name="address"
              placeholder="e.g. 123 Romulo Blvd"
              value={form.address}
              onChange={handleChange}
              required
            />

            <label style={s.label}>Barangay</label>
            <select style={s.input} name="barangay" value={form.barangay} onChange={handleChange}>
              <option value="">-- Select barangay --</option>
              {BARANGAYS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <label style={s.label}>📌 Pin your location on the map</label>
            <p style={s.hint}>Click anywhere on the map to set your exact location!</p>

            <div style={s.mapWrapper}>
              <MapContainer
                center={[15.4755, 120.596]}
                zoom={13}
                style={{ height: isMobile ? "220px" : "300px", width: "100%" }}
              >
                <TileLayer
                  url={dark
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />
                <LocationPicker onSelect={handleLocationSelect} />
                {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
              </MapContainer>
            </div>

            {markerPos && (
              <div style={s.coordsBadge}>
                ✅ Location pinned! ({parseFloat(form.lat).toFixed(4)},{" "}
                {parseFloat(form.lng).toFixed(4)})
              </div>
            )}
          </div>

          {/* Photos */}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>📸 Business photos</h3>
            <p style={s.hint}>You can upload multiple photos at once!</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              style={s.fileInput}
            />
            {photos.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "13px", color: dark ? "#8a7a6a" : "#aaa", marginBottom: "10px" }}>
                  {photos.length} photo{photos.length > 1 ? "s" : ""} selected
                </p>
                <div style={s.photoPreviewGrid}>
                  {photos.map((photo, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(photo)}
                      alt={`preview ${i}`}
                      style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "10px" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate("/")}>
              Cancel
            </button>
            <button
              type="submit"
              style={loading ? s.btnDisabled : s.btn}
              disabled={loading}
            >
              {loading
                ? `Uploading${photos.length > 1 ? ` ${photos.length} photos` : ""}...`
                : "🛖 List my business →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark, isMobile) {
  const DARK_TEXT = dark ? "#f0e8df" : "#2d2413";
  const CARD_BG = dark ? "#2d2413" : "white";
  const CARD_BORDER = dark ? "#4a3828" : "#f0e8df";
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";
  const SECONDARY = dark ? "#c8bfb4" : "#555";
  const INPUT_BG = dark ? "#3d2c1e" : "#fdfaf7";
  const INPUT_BORDER = dark ? "#5a4030" : "#e8e0d8";

  return {
    page: {
      backgroundColor: PAGE_BG,
      minHeight: "100vh",
      padding: isMobile ? "20px 16px" : "40px 24px",
    },
    container: { maxWidth: "720px", margin: "0 auto" },
    header: { marginBottom: "32px" },
    title: { fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: DARK_TEXT, marginBottom: "8px" },
    subtitle: { fontSize: "15px", color: dark ? "#8a7a6a" : "#888" },
    form: { display: "flex", flexDirection: "column", gap: "24px" },
    section: {
      backgroundColor: CARD_BG,
      borderRadius: "20px",
      padding: isMobile ? "20px 16px" : "28px",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${CARD_BORDER}`,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    sectionTitle: { fontSize: "16px", fontWeight: "700", color: DARK_TEXT, marginBottom: "16px" },
    grid2: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "16px",
      marginBottom: "4px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: SECONDARY,
      marginBottom: "6px",
      marginTop: "12px",
    },
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
      color: DARK_TEXT,
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
      color: DARK_TEXT,
      backgroundColor: INPUT_BG,
      resize: "vertical",
    },
    categoryGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
      gap: "10px",
      marginTop: "8px",
    },
    catBtn: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: "14px 8px",
      borderRadius: "14px",
      border: `1.5px solid ${INPUT_BORDER}`,
      backgroundColor: INPUT_BG,
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      color: SECONDARY,
      transition: "all 0.15s",
    },
    catBtnActive: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: "14px 8px",
      borderRadius: "14px",
      border: `2px solid ${ORANGE}`,
      backgroundColor: dark ? "#3d2413" : "#fff3ec",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      color: ORANGE,
      transition: "all 0.15s",
    },
    mapWrapper: {
      borderRadius: "16px",
      overflow: "hidden",
      marginTop: "8px",
      border: `1.5px solid ${INPUT_BORDER}`,
    },
    fileInput: {
      display: "block",
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: `1.5px dashed ${INPUT_BORDER}`,
      fontSize: "14px",
      cursor: "pointer",
      backgroundColor: INPUT_BG,
      fontFamily: "Poppins, sans-serif",
      boxSizing: "border-box",
      color: DARK_TEXT,
    },
    photoPreviewGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "10px",
    },
    hint: { fontSize: "13px", color: dark ? "#8a7a6a" : "#aaa", marginTop: "4px" },
    coordsBadge: {
      marginTop: "10px",
      backgroundColor: dark ? "#1e3010" : "#eaf3de",
      color: dark ? "#7abf4a" : "#3b6d11",
      padding: "10px 16px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
    },
    error: {
      backgroundColor: dark ? "#300a0a" : "#fff0f0",
      color: dark ? "#ff6b6b" : "#cc0000",
      padding: "14px 18px",
      borderRadius: "12px",
      fontSize: "14px",
      marginBottom: "8px",
    },
    actions: {
      display: "flex",
      gap: "12px",
      justifyContent: isMobile ? "stretch" : "flex-end",
      flexDirection: isMobile ? "column" : "row",
    },
    cancelBtn: {
      padding: "13px 28px",
      borderRadius: "12px",
      border: `1.5px solid ${INPUT_BORDER}`,
      backgroundColor: dark ? "#3d2c1e" : "white",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
      color: SECONDARY,
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
}

export default AddBusiness;
