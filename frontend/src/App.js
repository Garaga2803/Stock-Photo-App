import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Upload from "./components/Upload";
import Gallery from "./components/Gallery";
import ForgotPassword from "./components/ForgotPassword";
import HeroSection from "./components/HeroSection";
import "./App.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <div className="nav-left">
          <Link to="/">Home</Link>
        </div>
  <div className="nav-center">
    <span className="app-title">📸
    𝓟𝓱𝓸𝓽𝓸 𝓖𝓪𝓵𝓵𝓮𝓻𝔂</span>
  </div>
        <div className="nav-right">
          {!isLoggedIn ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              <Link to="/upload">Upload</Link>
              <Link to="/gallery">Gallery</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
