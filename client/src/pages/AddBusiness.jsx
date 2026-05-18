import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../api/axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BARANGAYS = [
  "Aguso",
  "Alvindia Segundo",
  "Amucao",
  "Armenia",
  "Asturias",
  "Atioc",
  "Balanti",
  "Balete",
  "Balibago I",
  "Balibago II",
  "Balingcanaway",
  "Banaoang",
  "Bañad",
  "Baras-Baras",
  "Batang-Batang",
  "Binauganan",
  "Bora",
  "Budoc",
  "Caarosipan",
  "Calantipe",
  "Calingcuan",
  "Calmay",
  "Capaoayan",
  "Carino",
  "Care",
  "Central",
  "Culipat",
  "Cut-cut I",
  "Cut-cut II",
  "Dalayap",
  "Dela Paz",
  "Dolores",
  "Dela Cruz",
  "Estrada",
  "F. Burg",
  "Gabon",
  "Galot",
  "Gubat",
  "Laoang",
  "Ligtasan",
  "Lourdes",
  "Mabilog",
  "Maliwalo",
  "Manupeg",
  "Marawi",
  "Matatalaib",
  "Matayumcab",
  "Monte Alegre",
  "Motrico",
  "Muñoz",
  "Nagserialan",
  "Pamaldan",
  "Panampunan",
  "Paraiso",
  "Poblacion",
  "Puting Kahoy",
  "Ramos",
  "Salapungan",
  "San Carlos",
  "San Francisco",
  "San Isidro",
  "San Jose",
  "San Juan de Mata",
  "San Luis",
  "San Manuel",
  "San Miguel",
  "San Rafael",
  "San Roque",
  "San Sebastian",
  "San Vicente",
  "Sanlanding",
  "Santo Cristo",
  "Santo Domingo",
  "Santos-Cabarangcalan",
  "Sapang Maragul",
  "Sapang Tagalog",
  "Sepung Calzada",
  "Sinait",
  "Suaverdez",
  "Tibag",
  "Tibagon",
  "Tinang",
  "Virgen delos Remedios",
  "Wakas",
];

// Map click handler component
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
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    barangay: "",
    lat: "",
    lng: "",
    phone: "",
  });
  const [photos, setPhotos] = useState([]);
  const [markerPos, setMarkerPos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = (lat, lng) => {
    setMarkerPos({ lat, lng });
    setForm((prev) => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

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
      });

      // Upload all photos
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏪 List your business</h1>
          <p style={styles.subtitle}>
            Fill in your business details and reach more customers in Tarlac!
          </p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Basic info */}
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

          {/* Location */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📍 Location</h3>

            <label style={styles.label}>Street address *</label>
            <input
              style={styles.input}
              name="address"
              placeholder="e.g. 123 Romulo Blvd"
              value={form.address}
              onChange={handleChange}
              required
            />

            <label style={styles.label}>Barangay</label>
            <select
              style={styles.input}
              name="barangay"
              value={form.barangay}
              onChange={handleChange}
            >
              <option value="">-- Select barangay --</option>
              {BARANGAYS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label style={styles.label}>📌 Pin your location on the map</label>
            <p style={styles.hint}>
              Click anywhere on the map to set your exact location!
            </p>

            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                marginTop: "8px",
                border: "1.5px solid #e8e0d8",
              }}
            >
              <MapContainer
                center={[15.4755, 120.596]}
                zoom={13}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onSelect={handleLocationSelect} />
                {markerPos && (
                  <Marker position={[markerPos.lat, markerPos.lng]} />
                )}
              </MapContainer>
            </div>

            {markerPos && (
              <div style={styles.coordsBadge}>
                ✅ Location pinned! ({parseFloat(form.lat).toFixed(4)},{" "}
                {parseFloat(form.lng).toFixed(4)})
              </div>
            )}
          </div>

          {/* Photos */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📸 Business photos</h3>
            <p style={styles.hint}>You can upload multiple photos at once!</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              style={styles.fileInput}
            />
            {photos.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#aaa",
                    marginBottom: "10px",
                  }}
                >
                  {photos.length} photo{photos.length > 1 ? "s" : ""} selected
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {photos.map((photo, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(photo)}
                      alt={`preview ${i}`}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
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

const styles = {
  page: {
    backgroundColor: "#fdf8f3",
    minHeight: "100vh",
    padding: "40px 24px",
  },
  container: { maxWidth: "720px", margin: "0 auto" },
  header: { marginBottom: "32px" },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#2d2413",
    marginBottom: "8px",
  },
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
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2d2413",
    marginBottom: "16px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "4px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
    marginTop: "12px",
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
  fileInput: {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1.5px dashed #e8e0d8",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#fdfaf7",
    fontFamily: "Poppins, sans-serif",
    boxSizing: "border-box",
  },
  hint: { fontSize: "13px", color: "#aaa", marginTop: "4px" },
  coordsBadge: {
    marginTop: "10px",
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
  },
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
