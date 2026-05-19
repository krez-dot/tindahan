import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessPage from "./pages/BusinessPage";
import AddBusiness from "./pages/AddBusiness";
import Profile from "./pages/Profile";
import OwnerDashboard from "./pages/OwnerDashboard";
import Announcements from "./pages/Announcements";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/add-business" element={<AddBusiness />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/announcements" element={<Announcements />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
