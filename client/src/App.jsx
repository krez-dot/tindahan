import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessPage from "./pages/BusinessPage";
import AddBusiness from "./pages/AddBusiness";
import Profile from "./pages/Profile";

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
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
