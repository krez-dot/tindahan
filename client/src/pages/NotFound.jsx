import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function NotFound() {
  const { dark } = useTheme();
  const PAGE_BG = dark ? "#1a1208" : "#fdf8f3";
  const TEXT = dark ? "#f0e8df" : "#2d2413";
  const MUTED = dark ? "#8a7a6a" : "#aaa";

  return (
    <div style={{ backgroundColor: PAGE_BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <p style={{ fontSize: "72px", marginBottom: "16px" }}>🛖</p>
      <h1 style={{ fontSize: "32px", fontWeight: "800", color: TEXT, marginBottom: "8px" }}>Page not found</h1>
      <p style={{ fontSize: "16px", color: MUTED, marginBottom: "32px" }}>That page doesn't exist. Maybe it moved or the URL is wrong.</p>
      <Link to="/" style={{ padding: "13px 32px", backgroundColor: "#e8601c", color: "white", borderRadius: "12px", textDecoration: "none", fontSize: "15px", fontWeight: "700", fontFamily: "Poppins, sans-serif" }}>
        ← Back to home
      </Link>
    </div>
  );
}

export default NotFound;
