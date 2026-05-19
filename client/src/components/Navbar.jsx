import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🛖 Tindahan
      </Link>
      <div style={styles.links}>
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
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    backgroundColor: "white",
    color: "#2d2413",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  brand: {
    color: "#e8601c",
    textDecoration: "none",
    fontSize: "22px",
    fontWeight: "800",
  },
  links: { display: "flex", gap: "20px", alignItems: "center" },
  link: {
    color: "#2d2413",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
  },
  btn: {
    backgroundColor: "#e8601c",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Navbar;
