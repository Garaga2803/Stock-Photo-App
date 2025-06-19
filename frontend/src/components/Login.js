import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Import the CSS file

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setIsLoggedIn(true);
      setMessage("Welcome back!");
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);
      setMessage("Login successful!");
      setIsLoggedIn(true);
    } catch (err) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setForm({ email: "", password: "" }); // Reset form
    setMessage(""); // Clear any message
    navigate("/login"); // Navigate to login
  };

  const goToUpload = () => navigate("/upload");
  const goToGallery = () => navigate("/gallery");

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLoggedIn ? "Welcome" : "Login"}</h2>

        {!isLoggedIn ? (
          <form onSubmit={handleSubmit}>
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
            {message && <p className="status-message">{message}</p>}
            <div className="login-link">
              Forgot your password? <Link to="/forgot-password">Reset here</Link>
            </div>
          </form>
        ) : (
          <div className="logged-in-actions">
            <p className="status-message">{message}</p>
            <button onClick={goToUpload}>📤 Go to Upload</button>
            <button onClick={goToGallery}>🖼️ Go to Gallery</button>
            <button onClick={handleLogout}>🔓 Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
