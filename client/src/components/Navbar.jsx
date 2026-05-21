import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

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

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🛖 Tindahan
      </Link>

      {/* Hamburger — mobile only */}
      {isMobile && (
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Desktop links */}
      {!isMobile && (
        <div style={styles.desktopLinks}>
          <Link to="/" style={styles.link}>
            Home
          </Link>
          <Link to="/announcements" style={styles.link}>
            Announcements
          </Link>
          {token ? (
            <>
              {user?.role === "owner" && (
                <Link to="/dashboard" style={styles.link}>
                  Dashboard
                </Link>
              )}
              <Link to="/profile" style={styles.link}>
                Profile
              </Link>
              <button onClick={logout} style={styles.btn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </>
          )}
        </div>
      )}

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={close}>
            🏠 Home
          </Link>
          <Link to="/announcements" style={styles.mobileLink} onClick={close}>
            📢 Announcements
          </Link>
          {token ? (
            <>
              {user?.role === "owner" && (
                <Link to="/dashboard" style={styles.mobileLink} onClick={close}>
                  📊 Dashboard
                </Link>
              )}
              <Link to="/profile" style={styles.mobileLink} onClick={close}>
                👤 Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  close();
                }}
                style={styles.mobileBtn}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={close}>
                🔑 Login
              </Link>
              <Link to="/register" style={styles.mobileLink} onClick={close}>
                📝 Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const ORANGE = "#e8601c";

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    backgroundColor: "white",
    color: "#2d2413",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
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
  hamburger: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#2d2413",
    padding: "4px 8px",
  },
  desktopLinks: { display: "flex", gap: "20px", alignItems: "center" },
  link: {
    color: "#2d2413",
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
    backgroundColor: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    zIndex: 999,
    borderTop: "1px solid #f0e8df",
  },
  mobileLink: {
    color: "#2d2413",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    padding: "16px 24px",
    borderBottom: "1px solid #f0e8df",
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

export default Navbar;
