import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/businesses/${id}`)
      .then((res) => {
        setBusiness(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;
  if (!business) return <p style={{ padding: "24px" }}>Business not found.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.name}>{business.name}</h1>
        {business.is_verified && <span style={styles.badge}>✅ Verified Business</span>}
        <p style={styles.desc}>{business.description}</p>
        <div style={styles.info}>
          <p>📍 {business.address}</p>
          <p>📞 {business.phone}</p>
          <p>👤 Owner: {business.owner_name}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "800px", margin: "0 auto" },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  name: { fontSize: "28px", marginBottom: "8px" },
  badge: {
    display: "inline-block",
    fontSize: "13px",
    backgroundColor: "#eaf3de",
    color: "#3b6d11",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "16px",
  },
  desc: { fontSize: "16px", color: "#444", marginBottom: "24px", lineHeight: "1.6" },
  info: { fontSize: "15px", color: "#555", lineHeight: "2" },
};

export default BusinessPage;
