import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const close = () => setMenuOpen(false);
  const s = getStyles(dark);

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        🛖 Tindahan
      </Link>

      {/* Right side — always has theme toggle; hamburger on mobile */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Desktop links */}
        {!isMobile && (
          <div style={s.desktopLinks}>
            <Link to="/" style={s.link}>Home</Link>
            <Link to="/announcements" style={s.link}>Announcements</Link>
            {token ? (
              <>
                {user?.role === "owner" && (
                  <Link to="/dashboard" style={s.link}>Dashboard</Link>
                )}
                {user?.role === "admin" && (
                  <Link to="/admin" style={s.adminLink}>🛡️ Admin</Link>
                )}
                <Link to="/profile" style={s.link}>Profile</Link>
                <button onClick={logout} style={s.btn}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={s.link}>Login</Link>
                <Link to="/register" style={s.link}>Register</Link>
              </>
            )}
          </div>
        )}

        <button style={s.themeToggle} onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? "☀️" : "🌙"}
        </button>

        {isMobile && (
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={s.mobileMenu}>
          <Link to="/" style={s.mobileLink} onClick={close}>🏠 Home</Link>
          <Link to="/announcements" style={s.mobileLink} onClick={close}>📢 Announcements</Link>
          {token ? (
            <>
              {user?.role === "owner" && (
                <Link to="/dashboard" style={s.mobileLink} onClick={close}>📊 Dashboard</Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin" style={s.mobileLink} onClick={close}>🛡️ Admin</Link>
              )}
              <Link to="/profile" style={s.mobileLink} onClick={close}>👤 Profile</Link>
              <button onClick={() => { logout(); close(); }} style={s.mobileBtn}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={s.mobileLink} onClick={close}>🔑 Login</Link>
              <Link to="/register" style={s.mobileLink} onClick={close}>📝 Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const ORANGE = "#e8601c";

function getStyles(dark) {
  return {
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 24px",
      backgroundColor: dark ? "#2d2413" : "white",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    },
    brand: {
      color: ORANGE,
      textDecoration: "none",
      fontSize: "20px",
      fontWeight: "800",
    },
    themeToggle: {
      background: "none",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      padding: "4px 6px",
      borderRadius: "8px",
      lineHeight: 1,
    },
    hamburger: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: dark ? "#f0e8df" : "#2d2413",
      padding: "4px 8px",
    },
    desktopLinks: { display: "flex", gap: "20px", alignItems: "center" },
    adminLink: {
      color: "#e8601c",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "700",
    },
    link: {
      color: dark ? "#f0e8df" : "#2d2413",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "500",
    },
    btn: {
      backgroundColor: ORANGE,
      color: "white",
      border: "none",
      padding: "8px 20px",
      borderRadius: "50px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      fontFamily: "Poppins, sans-serif",
    },
    mobileMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: dark ? "#2d2413" : "white",
      boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.12)",
      display: "flex",
      flexDirection: "column",
      zIndex: 999,
      borderTop: dark ? "1px solid #4a3828" : "1px solid #f0e8df",
    },
    mobileLink: {
      color: dark ? "#f0e8df" : "#2d2413",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "500",
      padding: "16px 24px",
      borderBottom: dark ? "1px solid #4a3828" : "1px solid #f0e8df",
      display: "block",
    },
    mobileBtn: {
      background: "none",
      border: "none",
      color: ORANGE,
      fontSize: "15px",
      fontWeight: "700",
      padding: "16px 24px",
      textAlign: "left",
      cursor: "pointer",
      fontFamily: "Poppins, sans-serif",
    },
  };
}

export default Navbar;
