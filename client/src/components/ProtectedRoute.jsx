import { Navigate } from "react-router-dom";

// role: "owner" | "customer" | "any" (just needs to be logged in)
function ProtectedRoute({ children, role = "any" }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "any" && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
