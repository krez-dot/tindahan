import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessPage from "./pages/BusinessPage";
import AddBusiness from "./pages/AddBusiness";
import Profile from "./pages/Profile";
import OwnerDashboard from "./pages/OwnerDashboard";
import Announcements from "./pages/Announcements";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
    <ToastProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* Logged in only */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Owner only */}
        <Route
          path="/add-business"
          element={
            <ProtectedRoute role="owner">
              <AddBusiness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
