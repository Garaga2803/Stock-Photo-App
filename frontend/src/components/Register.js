import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async () => {
    if (!form.email.endsWith("@gmail.com")) {
      setError("Email must end with @gmail.com");
      return;
    }

    try {
      await API.post("/auth/send-otp", { email: form.email });
      setOtpSent(true);
      setError("");
      setMessage("OTP sent to your email. Please verify.");
    } catch (err) {
      const msg = err.response?.data || "Failed to send OTP.";
      setError(msg);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      await API.post("/auth/verify-otp", {
        email: form.email,
        otp,
      });
      setOtpVerified(true);
      setError("");
      setMessage("OTP verified! Now complete registration.");
    } catch (err) {
      const msg = err.response?.data || "OTP verification failed.";
      setError(msg);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError("Please verify OTP before registering.");
      return;
    }

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setMessage("Registration successful! Redirecting...");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data || "Registration failed.";
      setError(msg);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        <form onSubmit={handleFinalSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
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

          {!otpSent && (
            <button type="button" onClick={sendOtp}>
              Send OTP
            </button>
          )}

          {otpSent && !otpVerified && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button type="button" onClick={verifyOtp}>
                Verify OTP
              </button>
            </>
          )}

          {otpVerified && <button type="submit">Complete Registration</button>}
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
